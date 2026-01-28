import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getNow } from '@/lib/utils';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const now = getNow(req.headers);

    try {
        // TRANSACTION: Ensures we check limits AND update count atomically
        const result = await prisma.$transaction(async (tx: any) => {
            const paste = await tx.paste.findUnique({ where: { id } });

            if (!paste) return null;

            // Check Time Expiry
            if (paste.expires_at && paste.expires_at < now) return null;

            // Check View Limit
            if (paste.max_views && paste.view_count >= paste.max_views) return null;

            // Increment View Count
            return await tx.paste.update({
                where: { id },
                data: { view_count: { increment: 1 } }
            });
        });

        if (!result) {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        return NextResponse.json({
            content: result.content,
            remaining_views: result.max_views ? result.max_views - result.view_count : null,
            expires_at: result.expires_at
        });
    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

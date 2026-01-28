import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // Simple query to verify DB connection
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}

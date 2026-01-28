export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getNow } from '@/lib/utils';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { content, ttl_seconds, max_views } = body;

        // 1. Validation
        if (!content || typeof content !== 'string' || content.trim() === '') {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const now = getNow(req.headers);
        const id = nanoid(10); // Generates a random 10-char ID

        // 2. Calculate Expiry
        // If ttl_seconds is provided, add it to the current time
        const expiresAt = ttl_seconds
            ? new Date(now.getTime() + (parseInt(ttl_seconds) * 1000))
            : null;

        // 3. Save to DB
        const paste = await prisma.paste.create({
            data: {
                id,
                content,
                max_views: max_views ? parseInt(max_views) : null,
                expires_at: expiresAt,
            },
        });

        // 4. Return Response
        // Uses the request URL to build the full link dynamically
        const baseUrl = new URL(req.url).origin;
        return NextResponse.json({
            id: paste.id,
            url: `${baseUrl}/p/${paste.id}`
        }, { status: 201 });

    } catch (e) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
}

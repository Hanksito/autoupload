import { NextRequest, NextResponse } from "next/server";
import { getAllPosts, createPost, Platform } from "@/lib/db";
import { initializeDatabase } from "@/lib/db";

export async function GET() {
    try {
        await initializeDatabase();
        const posts = await getAllPosts();
        return NextResponse.json({ posts });
    } catch (error) {
        console.error("GET /api/posts error:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await initializeDatabase();
        const body = await request.json();

        const { title, description, hashtags, mediaUrl, mediaPublicId, platforms, scheduledAt } = body;

        if (!title || !mediaUrl || !platforms?.length || !scheduledAt) {
            return NextResponse.json(
                { error: "Missing required fields: title, mediaUrl, platforms, scheduledAt" },
                { status: 400 }
            );
        }

        const scheduledDate = new Date(scheduledAt);
        if (scheduledDate <= new Date()) {
            return NextResponse.json(
                { error: "Scheduled time must be in the future" },
                { status: 400 }
            );
        }

        const post = await createPost({
            title,
            description: description || "",
            hashtags: hashtags || [],
            media_url: mediaUrl,
            media_public_id: mediaPublicId || "",
            platforms: platforms as Platform[],
            scheduled_at: scheduledAt,
        });

        return NextResponse.json({ post }, { status: 201 });
    } catch (error) {
        console.error("POST /api/posts error:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}

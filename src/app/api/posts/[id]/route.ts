import { NextRequest, NextResponse } from "next/server";
import { getPostById, deletePost } from "@/lib/db";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const post = await getPostById(id);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }
        return NextResponse.json({ post });
    } catch (error) {
        console.error("GET /api/posts/[id] error:", error);
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const post = await getPostById(id);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }
        if (post.status === "published") {
            return NextResponse.json({ error: "Cannot delete an already published post" }, { status: 400 });
        }
        await deletePost(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/posts/[id] error:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}

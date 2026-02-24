import { NextRequest, NextResponse } from "next/server";
import { updatePostStatus } from "@/lib/db";

// n8n calls this webhook after publishing to update the post status
export async function POST(request: NextRequest) {
    const secret = request.headers.get("x-webhook-secret");
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { postId, success, platformResults, errorMessage } = body;

        if (!postId) {
            return NextResponse.json({ error: "postId is required" }, { status: 400 });
        }

        await updatePostStatus(
            postId,
            success ? "published" : "failed",
            platformResults,
            success ? undefined : errorMessage
        );

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("n8n callback error:", error);
        return NextResponse.json({ error: "Callback failed" }, { status: 500 });
    }
}

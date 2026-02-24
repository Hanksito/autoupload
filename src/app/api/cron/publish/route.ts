import { NextResponse } from "next/server";
import { getPendingPostsDue, updatePostStatus } from "@/lib/db";
import { triggerN8nPublish } from "@/lib/n8n";

// This route is called by Vercel Cron every minute
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/publish", "schedule": "* * * * *" }] }
export async function GET(request: Request) {
    // Verify this is called by Vercel Cron (in production)
    const authHeader = request.headers.get("authorization");
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const pendingPosts = await getPendingPostsDue();

        if (pendingPosts.length === 0) {
            return NextResponse.json({ message: "No posts to publish", count: 0 });
        }

        const results = await Promise.allSettled(
            pendingPosts.map(async (post) => {
                // Mark as publishing to avoid double-publish
                await updatePostStatus(post.id, "publishing");

                try {
                    await triggerN8nPublish(post);
                    // n8n will call back our webhook to update the final status
                    return { postId: post.id, triggered: true };
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    await updatePostStatus(post.id, "failed", undefined, errorMessage);
                    return { postId: post.id, triggered: false, error: errorMessage };
                }
            })
        );

        const successful = results.filter(
            (r) => r.status === "fulfilled" && r.value.triggered
        ).length;

        return NextResponse.json({
            message: `Processed ${pendingPosts.length} posts, triggered ${successful} successfully`,
            processed: pendingPosts.length,
            successful,
        });
    } catch (error) {
        console.error("Cron publish error:", error);
        return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
    }
}

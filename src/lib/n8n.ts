import { ScheduledPost } from "./db";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!;
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET!;

export async function triggerN8nPublish(post: ScheduledPost): Promise<void> {
    if (!N8N_WEBHOOK_URL) {
        throw new Error("N8N_WEBHOOK_URL is not configured");
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Webhook-Secret": N8N_WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({
            postId: post.id,
            title: post.title,
            description: post.description,
            hashtags: post.hashtags,
            mediaUrl: post.media_url,
            platforms: post.platforms,
            caption: buildCaption(post),
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`n8n webhook failed: ${response.status} ${text}`);
    }
}

function buildCaption(post: ScheduledPost): string {
    const hashtagString = post.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
    return `${post.description}\n\n${hashtagString}`.trim();
}

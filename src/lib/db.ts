import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export { sql };

export type Platform = "instagram" | "tiktok" | "youtube" | "twitter";
export type PostStatus = "pending" | "publishing" | "published" | "failed";

export interface ScheduledPost {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  media_url: string;
  media_public_id: string;
  platforms: Platform[];
  scheduled_at: string;
  status: PostStatus;
  error_message?: string;
  platform_results?: Record<string, { success: boolean; url?: string; error?: string }>;
  created_at: string;
  updated_at: string;
}

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS scheduled_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      hashtags TEXT[] NOT NULL DEFAULT '{}',
      media_url TEXT NOT NULL,
      media_public_id TEXT NOT NULL DEFAULT '',
      platforms TEXT[] NOT NULL DEFAULT '{}',
      scheduled_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      platform_results JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

export async function getAllPosts(): Promise<ScheduledPost[]> {
  const rows = await sql`
    SELECT * FROM scheduled_posts
    ORDER BY scheduled_at ASC
  `;
  return rows as ScheduledPost[];
}

export async function getPostById(id: string): Promise<ScheduledPost | null> {
  const rows = await sql`
    SELECT * FROM scheduled_posts WHERE id = ${id}
  `;
  return (rows[0] as ScheduledPost) || null;
}

export async function createPost(data: {
  title: string;
  description: string;
  hashtags: string[];
  media_url: string;
  media_public_id: string;
  platforms: Platform[];
  scheduled_at: string;
}): Promise<ScheduledPost> {
  const rows = await sql`
    INSERT INTO scheduled_posts (title, description, hashtags, media_url, media_public_id, platforms, scheduled_at)
    VALUES (
      ${data.title},
      ${data.description},
      ${data.hashtags},
      ${data.media_url},
      ${data.media_public_id},
      ${data.platforms},
      ${data.scheduled_at}
    )
    RETURNING *
  `;
  return rows[0] as ScheduledPost;
}

export async function updatePostStatus(
  id: string,
  status: PostStatus,
  platformResults?: Record<string, { success: boolean; url?: string; error?: string }>,
  errorMessage?: string
): Promise<void> {
  await sql`
    UPDATE scheduled_posts
    SET
      status = ${status},
      platform_results = ${platformResults ? JSON.stringify(platformResults) : null},
      error_message = ${errorMessage || null},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deletePost(id: string): Promise<void> {
  await sql`DELETE FROM scheduled_posts WHERE id = ${id}`;
}

export async function getPendingPostsDue(): Promise<ScheduledPost[]> {
  const rows = await sql`
    SELECT * FROM scheduled_posts
    WHERE status = 'pending'
    AND scheduled_at <= NOW()
    ORDER BY scheduled_at ASC
  `;
  return rows as ScheduledPost[];
}

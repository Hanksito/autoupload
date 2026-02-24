"use client";

import { ScheduledPost } from "@/lib/db";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const PLATFORM_ICONS: Record<string, string> = {
    instagram: "📸",
    tiktok: "🎵",
    youtube: "▶️",
    twitter: "𝕏",
};

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "⏳ Pendiente" },
    publishing: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "🔄 Publicando..." },
    published: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "✅ Publicado" },
    failed: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "❌ Fallido" },
};

interface PostCardProps {
    post: ScheduledPost;
    onDelete: (id: string) => void;
    compact?: boolean;
}

export function PostCard({ post, onDelete, compact = false }: PostCardProps) {
    const statusStyle = STATUS_STYLES[post.status] || STATUS_STYLES.pending;
    const scheduledDate = parseISO(post.scheduled_at);

    return (
        <div
            className="glass-card animate-fade-in"
            style={{
                padding: compact ? "12px 16px" : "20px 24px",
                display: "flex",
                gap: compact ? 12 : 20,
                alignItems: compact ? "center" : "flex-start",
                transition: "all 0.2s",
            }}
        >
            {/* Thumbnail / Video indicator */}
            {!compact && (
                <div
                    style={{
                        width: 80,
                        height: 140,
                        borderRadius: 10,
                        background: "linear-gradient(135deg, var(--bg-secondary), var(--border))",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                        border: "1px solid var(--border)",
                    }}
                >
                    🎬
                </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                        <h3
                            style={{
                                fontSize: compact ? 13 : 15,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: compact ? 200 : 500,
                            }}
                        >
                            {post.title}
                        </h3>
                        {!compact && post.description && (
                            <p
                                style={{
                                    fontSize: 13,
                                    color: "var(--text-muted)",
                                    marginTop: 4,
                                    overflow: "hidden",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                }}
                            >
                                {post.description}
                            </p>
                        )}
                    </div>

                    {/* Status badge */}
                    <span
                        style={{
                            flexShrink: 0,
                            fontSize: 12,
                            fontWeight: 600,
                            color: statusStyle.color,
                            background: statusStyle.bg,
                            padding: "4px 10px",
                            borderRadius: 20,
                            border: `1px solid ${statusStyle.color}40`,
                        }}
                    >
                        {statusStyle.label}
                    </span>
                </div>

                <div style={{ marginTop: compact ? 4 : 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    {/* Date */}
                    <span
                        style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        🕒{" "}
                        {format(scheduledDate, compact ? "dd/MM/yy HH:mm" : "EEEE d MMM yyyy, HH:mm", {
                            locale: es,
                        })}
                    </span>

                    {/* Platforms */}
                    <div style={{ display: "flex", gap: 4 }}>
                        {post.platforms.map((p) => (
                            <span
                                key={p}
                                title={p}
                                style={{
                                    fontSize: compact ? 14 : 16,
                                    lineHeight: 1,
                                }}
                            >
                                {PLATFORM_ICONS[p] || "🌐"}
                            </span>
                        ))}
                    </div>

                    {/* Hashtags */}
                    {!compact && post.hashtags?.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {post.hashtags.slice(0, 4).map((tag) => (
                                <span
                                    key={tag}
                                    style={{
                                        fontSize: 11,
                                        color: "var(--accent-purple-light)",
                                        background: "rgba(124,58,237,0.1)",
                                        padding: "2px 8px",
                                        borderRadius: 10,
                                    }}
                                >
                                    #{tag}
                                </span>
                            ))}
                            {post.hashtags.length > 4 && (
                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{post.hashtags.length - 4}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Platform results */}
                {!compact && post.platform_results && post.status === "published" && (
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        {Object.entries(post.platform_results as Record<string, { success: boolean; url?: string }>).map(
                            ([platform, result]) => (
                                <a
                                    key={platform}
                                    href={result.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        fontSize: 12,
                                        color: result.success ? "var(--accent-green)" : "var(--accent-red)",
                                        background: result.success ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                                        padding: "3px 10px",
                                        borderRadius: 8,
                                        textDecoration: "none",
                                    }}
                                >
                                    {PLATFORM_ICONS[platform]} {result.success ? "Ver post" : "Error"}
                                </a>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Delete button */}
            {post.status === "pending" && (
                <button
                    className="btn-danger"
                    onClick={() => onDelete(post.id)}
                    style={{ flexShrink: 0, alignSelf: compact ? "center" : "flex-start" }}
                >
                    {compact ? "×" : "Eliminar"}
                </button>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ScheduledPost } from "@/lib/db";
import { CalendarView } from "@/components/CalendarView";
import { PostCard } from "@/components/PostCard";

type View = "list" | "calendar";

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  twitter: "𝕏",
};

export default function HomePage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("calendar");
  const [filter, setFilter] = useState<string>("all");

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      console.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const stats = {
    total: posts.length,
    pending: posts.filter((p) => p.status === "pending").length,
    published: posts.filter((p) => p.status === "published").length,
    failed: posts.filter((p) => p.status === "failed").length,
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este post programado?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(10,10,15,0.9)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🪐
            </div>
            <div>
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #9f67ff, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Perihelion
              </h1>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: -2 }}>
                Social Media Scheduler
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <nav style={{ display: "flex", gap: 4 }}>
              {(["calendar", "list"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: view === v ? "var(--accent-purple)" : "var(--border)",
                    background: view === v ? "rgba(124,58,237,0.15)" : "transparent",
                    color: view === v ? "var(--accent-purple-light)" : "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {v === "calendar" ? "📅 Calendario" : "📋 Lista"}
                </button>
              ))}
            </nav>

            <Link href="/new">
              <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
                + Nuevo Post
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            { label: "Total posts", value: stats.total, color: "var(--accent-purple-light)", icon: "🗓️" },
            { label: "Programados", value: stats.pending, color: "var(--accent-yellow)", icon: "⏳" },
            { label: "Publicados", value: stats.published, color: "var(--accent-green)", icon: "✅" },
            { label: "Con error", value: stats.failed, color: "var(--accent-red)", icon: "❌" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card"
              style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}
            >
              <span style={{ fontSize: 28 }}>{stat.icon}</span>
              <div>
                <p style={{ fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Platform legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Plataformas:</span>
          {Object.entries(PLATFORM_ICONS).map(([platform, icon]) => (
            <span
              key={platform}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--text-secondary)",
                background: "var(--bg-card)",
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid var(--border)",
              }}
            >
              {icon} {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </span>
          ))}
        </div>

        {/* Main content */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 300,
              color: "var(--text-muted)",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent-purple)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Cargando posts...
          </div>
        ) : view === "calendar" ? (
          <CalendarView posts={posts} onDeletePost={handleDelete} />
        ) : (
          <div>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[
                { value: "all", label: "Todos" },
                { value: "pending", label: "Pendientes" },
                { value: "published", label: "Publicados" },
                { value: "failed", label: "Fallidos" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: filter === f.value ? "var(--accent-purple)" : "var(--border)",
                    background: filter === f.value ? "rgba(124,58,237,0.15)" : "transparent",
                    color: filter === f.value ? "var(--accent-purple-light)" : "var(--text-secondary)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredPosts.length === 0 ? (
              <EmptyState />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        textAlign: "center",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 64 }}>🚀</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
        Sin posts programados
      </h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 400 }}>
        Crea tu primer post y olvídate. Perihelion publicará en todas tus redes a la hora exacta.
      </p>
      <Link href="/new">
        <button className="btn-primary">+ Crear primer Reel</button>
      </Link>
    </div>
  );
}

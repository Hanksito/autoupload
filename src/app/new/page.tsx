"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLATFORMS = [
    { id: "instagram", label: "Instagram", icon: "📸", desc: "Reels" },
    { id: "tiktok", label: "TikTok", icon: "🎵", desc: "Vídeos" },
    { id: "youtube", label: "YouTube", icon: "▶️", desc: "Shorts" },
    { id: "twitter", label: "X / Twitter", icon: "𝕏", desc: "Vídeo tweet", optional: true },
];

export default function NewPostPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [hashtagInput, setHashtagInput] = useState("");
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [platforms, setPlatforms] = useState<string[]>(["instagram", "tiktok", "youtube"]);
    const [scheduledAt, setScheduledAt] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set minimum datetime to now
    const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
        .toISOString()
        .slice(0, 16);

    const handleFileSelect = (file: File) => {
        const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];
        if (!allowedTypes.includes(file.type)) {
            setError("Solo se admiten vídeos en formato MP4, MOV o WebM.");
            return;
        }
        if (file.size > 500 * 1024 * 1024) {
            setError("El vídeo no puede superar los 500MB.");
            return;
        }
        setError(null);
        setVideoFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const addHashtag = () => {
        const tag = hashtagInput.trim().replace(/^#+/, "");
        if (tag && !hashtags.includes(tag)) {
            setHashtags([...hashtags, tag]);
        }
        setHashtagInput("");
    };

    const removeHashtag = (tag: string) => {
        setHashtags(hashtags.filter((h) => h !== tag));
    };

    const togglePlatform = (id: string) => {
        setPlatforms((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!videoFile) { setError("Selecciona un vídeo."); return; }
        if (!title.trim()) { setError("El título es obligatorio."); return; }
        if (platforms.length === 0) { setError("Selecciona al menos una plataforma."); return; }
        if (!scheduledAt) { setError("Selecciona la fecha y hora de publicación."); return; }

        try {
            setUploading(true);

            // 1. Upload video to Cloudinary
            const formData = new FormData();
            formData.append("file", videoFile);
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                throw new Error(err.error || "Error subiendo el vídeo");
            }
            const { url: mediaUrl, publicId: mediaPublicId } = await uploadRes.json();

            setUploading(false);
            setSubmitting(true);

            // 2. Schedule the post
            const postRes = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    hashtags,
                    mediaUrl,
                    mediaPublicId,
                    platforms,
                    scheduledAt: new Date(scheduledAt).toISOString(),
                }),
            });

            if (!postRes.ok) {
                const err = await postRes.json();
                throw new Error(err.error || "Error programando el post");
            }

            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setUploading(false);
            setSubmitting(false);
        }
    };

    const isLoading = uploading || submitting;

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
                        maxWidth: 800,
                        margin: "0 auto",
                        padding: "0 24px",
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 22 }}>
                        ←
                    </Link>
                    <div>
                        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                            Nuevo Reel
                        </h1>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            Programa una publicación en múltiples plataformas
                        </p>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Video Upload */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 12 }}>
                            📹 Vídeo del Reel *
                        </label>

                        {previewUrl ? (
                            <div style={{ position: "relative" }}>
                                <video
                                    src={previewUrl}
                                    controls
                                    style={{
                                        width: "100%",
                                        maxHeight: 360,
                                        borderRadius: 10,
                                        background: "#000",
                                        objectFit: "contain",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => { setVideoFile(null); setPreviewUrl(null); }}
                                    style={{
                                        position: "absolute",
                                        top: 10,
                                        right: 10,
                                        background: "rgba(0,0,0,0.7)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 6,
                                        padding: "4px 10px",
                                        fontSize: 12,
                                        cursor: "pointer",
                                    }}
                                >
                                    Cambiar
                                </button>
                                <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                                    📎 {videoFile?.name} ({((videoFile?.size || 0) / 1024 / 1024).toFixed(1)} MB)
                                </p>
                            </div>
                        ) : (
                            <div
                                className={`drop-zone ${dragging ? "active" : ""}`}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("video-input")?.click()}
                            >
                                <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
                                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                                    Arrastra tu vídeo aquí o haz clic
                                </p>
                                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                    MP4, MOV o WebM — máx. 500MB — Recomendado: 9:16 vertical
                                </p>
                                <input
                                    id="video-input"
                                    type="file"
                                    accept="video/mp4,video/quicktime,video/webm"
                                    style={{ display: "none" }}
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                />
                            </div>
                        )}
                    </div>

                    {/* Title & Description */}
                    <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 8 }}>
                                ✏️ Título *
                            </label>
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Título del post (se usa en YouTube Shorts)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                                required
                            />
                            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right", marginTop: 4 }}>
                                {title.length}/100
                            </p>
                        </div>

                        <div>
                            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 8 }}>
                                📝 Descripción / Caption
                            </label>
                            <textarea
                                className="input-field"
                                placeholder="Descripción que se usará en Instagram, TikTok y X..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                maxLength={2200}
                                style={{ resize: "vertical", minHeight: 100 }}
                            />
                            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right", marginTop: 4 }}>
                                {description.length}/2200
                            </p>
                        </div>

                        {/* Hashtags */}
                        <div>
                            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 8 }}>
                                # Hashtags
                            </label>
                            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Escribe un hashtag y presiona Enter"
                                    value={hashtagInput}
                                    onChange={(e) => setHashtagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHashtag(); } }}
                                    style={{ flex: 1 }}
                                />
                                <button type="button" className="btn-secondary" onClick={addHashtag} style={{ whiteSpace: "nowrap" }}>
                                    + Añadir
                                </button>
                            </div>
                            {hashtags.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {hashtags.map((tag) => (
                                        <span
                                            key={tag}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 6,
                                                background: "rgba(124,58,237,0.15)",
                                                border: "1px solid rgba(124,58,237,0.3)",
                                                borderRadius: 20,
                                                padding: "4px 12px",
                                                fontSize: 13,
                                                color: "var(--accent-purple-light)",
                                            }}
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => removeHashtag(tag)}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, lineHeight: 1 }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Platforms */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 16 }}>
                            🌐 Plataformas de publicación *
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                            {PLATFORMS.map((p) => {
                                const selected = platforms.includes(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => togglePlatform(p.id)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: "16px 20px",
                                            borderRadius: 12,
                                            border: "2px solid",
                                            borderColor: selected ? "var(--accent-purple)" : "var(--border)",
                                            background: selected ? "rgba(124,58,237,0.12)" : "var(--bg-secondary)",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        <span style={{ fontSize: 28 }}>{p.icon}</span>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: selected ? "var(--text-primary)" : "var(--text-secondary)" }}>
                                                {p.label}
                                                {p.optional && (
                                                    <span style={{ marginLeft: 6, fontSize: 10, color: "var(--accent-yellow)", background: "rgba(245,158,11,0.15)", padding: "2px 6px", borderRadius: 4 }}>
                                                        Requiere API de pago
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.desc}</div>
                                        </div>
                                        <div
                                            style={{
                                                marginLeft: "auto",
                                                width: 20,
                                                height: 20,
                                                borderRadius: "50%",
                                                border: "2px solid",
                                                borderColor: selected ? "var(--accent-purple)" : "var(--border-light)",
                                                background: selected ? "var(--accent-purple)" : "transparent",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 11,
                                                color: "white",
                                            }}
                                        >
                                            {selected && "✓"}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Schedule Date/Time */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 8 }}>
                            🕒 Fecha y hora de publicación *
                        </label>
                        <input
                            className="input-field"
                            type="datetime-local"
                            value={scheduledAt}
                            min={minDateTime}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            required
                            style={{ maxWidth: 320 }}
                        />
                        {scheduledAt && (
                            <p style={{ marginTop: 8, fontSize: 13, color: "var(--accent-green)" }}>
                                ✅ Programado para el{" "}
                                {new Date(scheduledAt).toLocaleString("es-ES", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                borderRadius: 10,
                                padding: "12px 16px",
                                fontSize: 14,
                                color: "var(--accent-red)",
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                        <Link href="/">
                            <button type="button" className="btn-secondary">
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {uploading ? (
                                <>
                                    <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                    Subiendo vídeo...
                                </>
                            ) : submitting ? (
                                <>
                                    <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                    Programando...
                                </>
                            ) : (
                                "🚀 Programar Reel"
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

"use client";

import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    parseISO,
    isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { ScheduledPost } from "@/lib/db";
import { PostCard } from "./PostCard";

const PLATFORM_COLORS: Record<string, string> = {
    instagram: "#e1306c",
    tiktok: "#69c9d0",
    youtube: "#ff0000",
    twitter: "#1da1f2",
};

interface CalendarViewProps {
    posts: ScheduledPost[];
    onDeletePost: (id: string) => void;
}

export function CalendarView({ posts, onDeletePost }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
        days.push(day);
        day = addDays(day, 1);
    }

    const getPostsForDay = (date: Date) =>
        posts.filter((p) => isSameDay(parseISO(p.scheduled_at), date));

    const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay) : [];

    const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    return (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            {/* Calendar */}
            <div className="glass-card" style={{ padding: 24, flex: 1 }}>
                {/* Navigation */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "6px 12px",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            fontSize: 16,
                        }}
                    >
                        ‹
                    </button>

                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", textTransform: "capitalize" }}>
                        {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </h2>

                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "6px 12px",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            fontSize: 16,
                        }}
                    >
                        ›
                    </button>
                </div>

                {/* Weekday headers */}
                <div className="calendar-grid" style={{ marginBottom: 8 }}>
                    {WEEKDAYS.map((d) => (
                        <div
                            key={d}
                            style={{
                                textAlign: "center",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                padding: "4px 0",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="calendar-grid">
                    {days.map((d) => {
                        const dayPosts = getPostsForDay(d);
                        const isCurrentMonth = isSameMonth(d, currentMonth);
                        const isSelected = selectedDay && isSameDay(d, selectedDay);
                        const todayDay = isToday(d);

                        return (
                            <div
                                key={d.toISOString()}
                                className={`calendar-day${todayDay ? " today" : ""}${!isCurrentMonth ? " other-month" : ""}${dayPosts.length > 0 ? " has-posts" : ""}`}
                                onClick={() => setSelectedDay(isSelected ? null : d)}
                                style={{
                                    borderColor: isSelected ? "var(--accent-purple-light)" : todayDay ? "var(--accent-purple)" : "transparent",
                                    background: isSelected
                                        ? "rgba(124,58,237,0.2)"
                                        : dayPosts.length > 0
                                            ? "rgba(124,58,237,0.07)"
                                            : undefined,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 13,
                                        fontWeight: todayDay ? 700 : 400,
                                        color: todayDay
                                            ? "var(--accent-purple-light)"
                                            : isCurrentMonth
                                                ? "var(--text-primary)"
                                                : "var(--text-muted)",
                                        marginBottom: 4,
                                    }}
                                >
                                    {format(d, "d")}
                                </span>

                                {/* Post dots */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                                    {dayPosts.slice(0, 6).map((p) => (
                                        <div
                                            key={p.id}
                                            className="post-dot"
                                            title={`${p.title} — ${p.platforms.join(", ")}`}
                                            style={{
                                                background:
                                                    p.status === "published"
                                                        ? "var(--accent-green)"
                                                        : p.status === "failed"
                                                            ? "var(--accent-red)"
                                                            : p.status === "publishing"
                                                                ? "var(--accent-blue)"
                                                                : PLATFORM_COLORS[p.platforms[0]] || "var(--accent-purple)",
                                            }}
                                        />
                                    ))}
                                    {dayPosts.length > 6 && (
                                        <span style={{ fontSize: 9, color: "var(--text-muted)" }}>+{dayPosts.length - 6}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ marginTop: 20, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {[
                        { color: "var(--accent-yellow)", label: "Pendiente" },
                        { color: "var(--accent-green)", label: "Publicado" },
                        { color: "var(--accent-red)", label: "Error" },
                        { color: "var(--accent-blue)", label: "Publicando" },
                    ].map((l) => (
                        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected day panel */}
            <div style={{ width: 380, flexShrink: 0 }}>
                {selectedDay ? (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", textTransform: "capitalize" }}>
                                {format(selectedDay, "EEEE, d MMMM", { locale: es })}
                            </h3>
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                {selectedDayPosts.length === 0
                                    ? "Sin posts programados"
                                    : `${selectedDayPosts.length} post${selectedDayPosts.length > 1 ? "s" : ""}`}
                            </p>
                        </div>

                        {selectedDayPosts.length === 0 ? (
                            <div
                                className="glass-card"
                                style={{
                                    padding: 32,
                                    textAlign: "center",
                                    color: "var(--text-muted)",
                                    fontSize: 13,
                                }}
                            >
                                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                                Sin posts para este día
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {selectedDayPosts
                                    .sort(
                                        (a, b) =>
                                            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
                                    )
                                    .map((post) => (
                                        <PostCard key={post.id} post={post} onDelete={onDeletePost} compact />
                                    ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className="glass-card"
                        style={{
                            padding: 40,
                            textAlign: "center",
                            color: "var(--text-muted)",
                        }}
                    >
                        <div style={{ fontSize: 40, marginBottom: 12 }}>👆</div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
                            Haz clic en un día
                        </p>
                        <p style={{ fontSize: 13, marginTop: 4 }}>para ver los posts programados</p>
                    </div>
                )}
            </div>
        </div>
    );
}

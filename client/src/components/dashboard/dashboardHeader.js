"use client";

// client/components/dashboard/DashboardHeader.js

import { TrendingUp, Calendar, Film } from "lucide-react";

export default function DashboardHeader({ movie, user }) {
  if (!movie) return null;

  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="dashboard-header">
      {/* Top row — welcome + meta */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-lexend)",
              fontSize: "13px",
              color: "var(--color-kritiq-ash)",
              marginBottom: "6px",
            }}
          >
            Partner Dashboard
          </p>
          <h1
            style={{
              fontFamily: "var(--font-clash)",
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: 700,
              color: "var(--color-kritiq-white)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {movie.title}
          </h1>
        </div>

        {/* Status badge */}
        <StatusBadge
          status={movie.status}
          daysUntil={movie.days_until_release}
        />
      </div>

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "12px",
        }}
      >
        {movie.genre && (
          <MetaItem icon={<Film size={13} />} text={movie.genre} />
        )}
        {releaseDate && (
          <MetaItem icon={<Calendar size={13} />} text={releaseDate} />
        )}
        <MetaItem
          icon={<TrendingUp size={13} />}
          text={`${movie.total_hype_votes?.toLocaleString() || 0} votes`}
        />
      </div>

      <style jsx>{`
        .dashboard-header {
          padding: 24px;
          background: var(--color-kritiq-dark-1);
          border: 1px solid var(--color-kritiq-dark-3);
          border-radius: var(--radius-card);
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status, daysUntil }) {
  const isPreRelease = status === "pre_release";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "var(--radius-pill)",
        fontSize: "12px",
        fontFamily: "var(--font-lexend)",
        fontWeight: 600,
        background: isPreRelease
          ? "rgba(255,68,51,0.12)"
          : "rgba(34,197,94,0.12)",
        color: isPreRelease ? "var(--color-kritiq-ember)" : "#22C55E",
        border: `1px solid ${isPreRelease ? "rgba(255,68,51,0.25)" : "rgba(34,197,94,0.25)"}`,
        whiteSpace: "nowrap",
      }}
    >
      {isPreRelease ? "🔥" : "✅"}
      {isPreRelease
        ? daysUntil != null
          ? `${daysUntil} days to release`
          : "Pre-Release"
        : "Released"}
    </span>
  );
}

function MetaItem({ icon, text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "var(--color-kritiq-ash)",
        fontSize: "13px",
        fontFamily: "var(--font-gilroy)",
      }}
    >
      {icon}
      {text}
    </div>
  );
}

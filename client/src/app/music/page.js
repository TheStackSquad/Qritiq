// client/src/app/music/page.js
"use client";

import { useState, Suspense } from "react";
import { Headphones } from "lucide-react";
import MusicFilterTabs from "../../components/music/musicUI/musicFilterTabs";
import MusicGrid from "../../components/music/musicUI/musicGrid";
import MusicGenreRow from "../../components/music/musicUI/musicGenreRow";
import { MusicGridSkeleton } from "../../components/music/musicDetails/musicSkeletons";
import {
  useMusicList,
  usePreReleaseMusic,
  useMusicByGenre,
} from "../../utils/hooks/useMusic";

// ─── Genre rows shown in "All" view ──────────────────────────────────────────
const GENRE_ROWS = [
  { genre: "Afrobeats", emoji: "🎸" },
  { genre: "Amapiano", emoji: "🎹" },
  { genre: "Alte", emoji: "✨" },
  { genre: "Hip-Hop", emoji: "🎧" },
];

function GenreSection({ genre, emoji }) {
  const { data: tracks = [], isLoading } = useMusicByGenre(genre, 10);
  if (isLoading) return <MusicGridSkeleton count={4} />;
  if (!tracks.length) return null;
  return <MusicGenreRow genre={genre} tracks={tracks} emoji={emoji} />;
}

function MusicListView({ tab, genre }) {
  const { data: allTracks = [], isLoading: loadingAll } = useMusicList(1);
  const { data: preTracks = [], isLoading: loadingPre } =
    usePreReleaseMusic(20);
  const { data: genreTracks = [], isLoading: loadingGenre } = useMusicByGenre(
    genre,
    20,
  );

  if (tab === "all" && !genre) {
    // Genre row layout
    if (loadingAll) return <MusicGridSkeleton count={6} />;
    return (
      <div className="ml-sections">
        {GENRE_ROWS.map((g) => (
          <GenreSection key={g.genre} genre={g.genre} emoji={g.emoji} />
        ))}
        <style jsx>{`
          .ml-sections {
            display: flex;
            flex-direction: column;
            gap: 32px;
          }
        `}</style>
      </div>
    );
  }

  // Filtered grid view
  let tracks = [];
  let loading = false;

  if (genre) {
    tracks = genreTracks;
    loading = loadingGenre;
  } else if (tab === "pre_release") {
    tracks = preTracks;
    loading = loadingPre;
  } else {
    tracks = allTracks.filter((t) => t.status === "released");
    loading = loadingAll;
  }

  if (loading) return <MusicGridSkeleton count={6} />;

  if (!tracks.length) {
    return (
      <div className="ml-empty">
        <p>No tracks found.</p>
        <style jsx>{`
          .ml-empty {
            padding: 48px 16px;
            text-align: center;
            font-family: var(--font-lexend, sans-serif);
            font-size: 14px;
            color: var(--color-kritiq-ash, #888);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="ml-grid-wrap">
      <MusicGrid tracks={tracks} />
      <style jsx>{`
        .ml-grid-wrap {
          padding: 0 16px;
        }
      `}</style>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MusicPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeGenre, setActiveGenre] = useState(null);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setActiveGenre(null);
  }

  function handleGenreChange(genre) {
    setActiveGenre(genre);
    if (genre) setActiveTab("all");
  }

  return (
    <main className="mp-root">
      {/* Page header */}
      <div className="mp-header">
        <div className="mp-badge">
          <Headphones size={13} strokeWidth={2.5} />
          Afrobeats & Beyond
        </div>
        <h1 className="mp-title">Music</h1>
        <p className="mp-sub">
          Rate upcoming drops and released tracks. Every vote shapes the hype
          meter.
        </p>
      </div>

      {/* Filter tabs */}
      <MusicFilterTabs
        activeTab={activeTab}
        activeGenre={activeGenre}
        onTabChange={handleTabChange}
        onGenreChange={handleGenreChange}
      />

      {/* Content */}
      <Suspense fallback={<MusicGridSkeleton count={6} />}>
        <MusicListView tab={activeTab} genre={activeGenre} />
      </Suspense>

      <style jsx>{`
        .mp-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 40px;
          min-height: 100vh;
          background: var(--color-kritiq-black, #0a0a0a);
        }

        .mp-header {
          padding: 20px 16px 4px;
        }

        .mp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 99px;
          padding: 4px 12px;
          margin-bottom: 12px;
        }

        .mp-title {
          font-family: var(--font-lexend, sans-serif);
          font-size: 32px;
          font-weight: 800;
          color: var(--color-kritiq-white, #fff);
          margin: 0 0 8px;
          line-height: 1.1;
        }

        .mp-sub {
          font-family: var(--font-lexend, sans-serif);
          font-size: 14px;
          color: var(--color-kritiq-ash, #888);
          margin: 0;
          line-height: 1.6;
        }
      `}</style>
    </main>
  );
}

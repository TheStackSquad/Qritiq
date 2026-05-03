"use client";

// client/components/dashboard/index.js
// Assembles the full partner dashboard UI.
// Receives data as props from the page — no fetching here.

import { useState } from "react";
import DashboardHeader from "./dashboardHeader";
import HypeMeter from "./hypeMeter";
import CityRankCards from "./cityRankCards";
import CompetitorTable from "./competitorTable";
import MovieSelector from "./movieSelector";

export default function Dashboard({ initialData, movies, user }) {
  const [selectedMovieId, setSelectedMovieId] = useState(
    initialData?.movie?.id || movies?.[0]?.id || null,
  );

  const data = initialData;

  return (
    <div className="dashboard-root">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="dashboard-sidebar">
        <MovieSelector
          movies={movies || []}
          selectedId={selectedMovieId}
          onSelect={setSelectedMovieId}
        />
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main className="dashboard-main">
        {/* Header */}
        <DashboardHeader movie={data?.movie} user={user} />

        {/* Top widgets row */}
        <div className="widgets-grid">
          <HypeMeter
            score={data?.hype_score || data?.movie?.hype_score || 0}
            totalVotes={data?.total_votes || data?.movie?.total_hype_votes || 0}
          />
          <CityRankCards demography={data?.demography} />
        </div>

        {/* Competitor table — full width */}
        <CompetitorTable
          competitors={data?.competitors || []}
          targetMovieId={selectedMovieId}
        />
      </main>

      <style jsx>{`
        .dashboard-root {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 20px;
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 16px;
          min-height: calc(100vh - 64px);
        }
        .dashboard-sidebar {
          position: sticky;
          top: 80px;
          height: fit-content;
        }
        .dashboard-main {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }
        .widgets-grid {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 20px;
        }

        /* Mobile — stack everything */
        @media (max-width: 768px) {
          .dashboard-root {
            grid-template-columns: 1fr;
            padding: 16px 12px;
          }
          .dashboard-sidebar {
            position: static;
          }
          .widgets-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

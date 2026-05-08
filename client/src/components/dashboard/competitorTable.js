"use client";

// client/components/dashboard/competitorTable.js
// Shows how the creator's movie compares to other trending titles.
// The creator's own movie is highlighted in red.

export default function CompetitorTable({ competitors = [], targetMovieId }) {
  const SEED = [
    {
      id: "seed-1",
      title: "Gangs of Lagos 2",
      hype_score: 91.2,
      total_hype_votes: 22100,
      total_likes: 31000,
      status: "pre_release",
      is_target: false,
    },
    {
      id: "seed-2",
      title: "Breath of Life",
      hype_score: 82.1,
      total_hype_votes: 11000,
      total_likes: 14200,
      status: "pre_release",
      is_target: false,
    },
    {
      id: "seed-3",
      title: "The Black Book 2",
      hype_score: 78.8,
      total_hype_votes: 9800,
      total_likes: 12300,
      status: "pre_release",
      is_target: false,
    },
    {
      id: "seed-4",
      title: "King Of Boys",
      hype_score: 64.5,
      total_hype_votes: 7200,
      total_likes: 9100,
      status: "released",
      is_target: false,
    },
    {
      id: "seed-5",
      title: "House of Ga'a",
      hype_score: 58.3,
      total_hype_votes: 5800,
      total_likes: 7400,
      status: "released",
      is_target: false,
    },
  ];

  const data = competitors.length > 0 ? competitors : SEED;

  const normalised = data.map((m, i) => ({
    ...m,
    _key: m.id || m.content_id || `fallback-key-${i}`,
    _votes: m.total_hype_votes ?? m.total_votes ?? 0,
  }));

  const sorted = [...normalised].sort((a, b) => b.hype_score - a.hype_score);

  const targetRank =
    sorted.findIndex(
      (m) =>
        m.is_target || m.id === targetMovieId || m.content_id === targetMovieId,
    ) + 1;

  return (
    <div className="comp-card">
      <div className="comp-header">
        <div>
          <p className="widget-label">Competitor Benchmarking</p>
          <p className="widget-sub">
            {targetRank > 0
              ? `Your film ranks #${targetRank} of ${sorted.length} this month`
              : "How your film compares to trending titles"}
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="comp-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Hype</th>
              <th>Votes</th>
              <th>Likes</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((movie, idx) => {
              const isTarget =
                movie.is_target ||
                movie.id === targetMovieId ||
                movie.content_id === targetMovieId;
              const rank = idx + 1;

              return (
                <tr key={movie._key} className={isTarget ? "target-row" : ""}>
                  {/* Rank */}
                  <td className="rank-cell">
                    <span className={`rank ${rank === 1 ? "rank--gold" : ""}`}>
                      {rank}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="title-cell">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {isTarget && <span className="you-badge">YOU</span>}
                      <span className="title-text">{movie.title}</span>
                    </div>
                    <span className={`status-dot ${movie.status}`}>
                      {movie.status === "pre_release"
                        ? "Pre-Release"
                        : "Released"}
                    </span>
                  </td>

                  {/* Hype score */}
                  <td className="hype-cell">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <HypeBar score={movie.hype_score} />
                      <span
                        className="hype-num"
                        style={{
                          color: isTarget
                            ? "var(--color-kritiq-ember)"
                            : "var(--color-kritiq-white)",
                        }}
                      >
                        {Number(movie.hype_score).toFixed(0)}%
                      </span>
                    </div>
                  </td>

                  {/* Votes */}
                  <td className="stat-cell">{movie._votes.toLocaleString()}</td>

                  {/* Likes */}
                  <td className="stat-cell">
                    {(movie.total_likes ?? 0).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .comp-card {
          background: var(--color-kritiq-dark-1);
          border: 1px solid var(--color-kritiq-dark-3);
          border-radius: var(--radius-card);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .comp-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .widget-label {
          font-family: var(--font-lexend);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
          margin: 0 0 4px;
        }
        .widget-sub {
          font-family: var(--font-gilroy);
          font-size: 13px;
          color: var(--color-kritiq-silver);
          margin: 0;
        }
        .table-wrap {
          overflow-x: auto;
        }
        .comp-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-gilroy);
          font-size: 13px;
        }
        .comp-table th {
          text-align: left;
          padding: 8px 12px;
          font-family: var(--font-lexend);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
          border-bottom: 1px solid var(--color-kritiq-dark-3);
          white-space: nowrap;
        }
        .comp-table td {
          padding: 12px;
          color: var(--color-kritiq-silver);
          border-bottom: 1px solid var(--color-kritiq-dark-3);
          vertical-align: middle;
        }
        .comp-table tr:last-child td {
          border-bottom: none;
        }
        .target-row td {
          background: rgba(192, 0, 26, 0.06);
          color: var(--color-kritiq-white);
        }
        .target-row:hover td {
          background: rgba(192, 0, 26, 0.1);
        }
        .comp-table tr:not(.target-row):hover td {
          background: var(--color-kritiq-dark-2);
        }
        .rank {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 13px;
          color: var(--color-kritiq-ash);
        }
        .rank--gold {
          color: #f59e0b;
        }
        .rank-cell {
          width: 32px;
          text-align: center;
        }
        .title-text {
          color: var(--color-kritiq-white);
          font-weight: 500;
        }
        .title-cell {
          min-width: 160px;
        }
        .you-badge {
          font-family: var(--font-lexend);
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(192, 0, 26, 0.2);
          color: var(--color-kritiq-ember);
          border: 1px solid rgba(192, 0, 26, 0.3);
          white-space: nowrap;
        }
        .status-dot {
          display: block;
          font-size: 10px;
          color: var(--color-kritiq-ash);
          margin-top: 2px;
        }
        .hype-cell {
          width: 140px;
        }
        .hype-num {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }
        .stat-cell {
          font-family: var(--font-mono);
          font-size: 12px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

function HypeBar({ score }) {
  const color = score >= 75 ? "#FF4433" : score >= 50 ? "#F59E0B" : "#6B6B72";
  return (
    <div
      style={{
        width: "64px",
        height: "4px",
        background: "var(--color-kritiq-dark-3)",
        borderRadius: "2px",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(score, 100)}%`,
          background: color,
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

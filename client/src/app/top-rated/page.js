// client/src/app/top-rated/page.js
"use client";


/**
 * /top-rated page
 * Renders three distinct sections in one scrollable page:
 *   1. Arena    — face-off battle cards + history
 *   2. Street Pull — leaderboard ranked by street_pull_score
 *   3. Spotlight — featured person + role-filtered grid
 *
 * Navigation: sticky ArenaTabs strip updates activeSection
 * via IntersectionObserver as the user scrolls.
 * Tapping a tab smoothly scrolls to that section anchor.
 *
 * Performance / Lighthouse:
 *  - No layout shift: skeletons match rendered dimensions exactly
 *  - Images: next/image lazy + explicit sizes on all cards
 *  - Animations: CSS-only transitions, IntersectionObserver triggers
 *  - No animation library loaded
 *  - Sections are code-split via dynamic import with ssr:false
 *    so the initial HTML payload stays small for low-bandwidth devices
 *
 * Accessibility:
 *  - Each section is a <section> with aria-labelledby
 *  - Tab navigation keyboard-friendly via role="tab" + aria-controls
 *  - Live regions on vote counts in BattleCard
 */

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ArenaTabs from "../../components/topRated/topRatedUI/arenaTabs";
import { useArena } from "../../utils/hooks/useArena";
import { useSpotlight } from "../../utils/hooks/useSpotlight";
import RoleFilterTabs from "../../components/topRated/topRatedUI/roleFilterTabs";
import {
//  BattleCardSkeleton,
//  LeaderboardSkeleton,
  PersonGridSkeleton
} from "../../components/topRated/topRatedUI/arenaSkeletons";
import { FeaturedHeroSkeleton } from "../../components/topRated/topRatedUI/spotlightSkeletons";

// ─── Dynamic imports — code-split heavy components ────────────────────────────
// ssr:false prevents server rendering of client-heavy battle/spotlight UI.
// Each chunk loads only when the user's browser requests it.

const BattleCard = dynamic(
  () => import("../../components/topRated/topRatedDetails/battleCard"),
);

const BattleHistory = dynamic(
  () => import("../../components/topRated/topRatedDetails/battleHistory"),
  { loading: () => null, ssr: false },
);

const StreetPullLeaderboard = dynamic(
  () => import("../../components/topRated/topRatedUI/streetPullLeaderboard"),
);

const FeaturedSpotlight = dynamic(
  () => import("../../components/topRated/topRatedUI/featuredSpotlight"),
);

const PersonGrid = dynamic(
  () => import("../../components/topRated/topRatedUI/personGrid"),
);

// ─── Section IDs ──────────────────────────────────────────────────────────────

const SECTION_IDS = ["arena", "leaderboard", "spotlight"];

// ─── Arena section ────────────────────────────────────────────────────────────

function ArenaSection({ battles, completedBattles, isLoading }) {
  const movieBattles = battles?.filter((b) => b.content_type === "movie") ?? [];
  const musicBattles = battles?.filter((b) => b.content_type === "music") ?? [];

  return (
    <section
      id="section-arena"
      aria-labelledby="arena-heading"
      className="tr-section"
    >
      {/* Section header */}
      <div className="tr-section-header">
        <div
          className="tr-section-accent tr-section-accent--red"
          aria-hidden="true"
        />
        <div>
          <h2 id="arena-heading" className="tr-section-title">
            ⚔️ Arena
          </h2>
          <p className="tr-section-sub">
            Who does the street rate more? Vote now.
          </p>
        </div>
      </div>

      {/* Active battles */}
      {isLoading ? (
        <div className="tr-battle-grid">
        </div>
      ) : (
        <>
          {movieBattles.length > 0 || musicBattles.length > 0 ? (
            <div className="tr-battle-grid">
              {movieBattles.map((b) => (
                <BattleCard key={b.id} battle={b} />
              ))}
              {musicBattles.map((b) => (
                <BattleCard key={b.id} battle={b} />
              ))}
            </div>
          ) : (
            <p className="tr-empty">
              No active battles right now. Check back Sunday.
            </p>
          )}
        </>
      )}

      {/* Battle history */}
      {completedBattles?.length > 0 && (
        <BattleHistory battles={completedBattles} />
      )}

      <style jsx>{`
        .tr-battle-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 0 16px;
        }
        @media (min-width: 768px) {
          .tr-battle-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
}

// ─── Spotlight section ────────────────────────────────────────────────────────

function SpotlightSection() {
  const [activeRole, setActiveRole] = useState("");
  const { data, isLoading } = useSpotlight({ role: activeRole });

  const featured = data?.featured ?? [];
  const persons = data?.persons ?? [];

  return (
    <section
      id="section-spotlight"
      aria-labelledby="spotlight-heading"
      className="tr-section"
    >
      <div className="tr-section-header">
        <div
          className="tr-section-accent tr-section-accent--purple"
          aria-hidden="true"
        />
        <div>
          <h2 id="spotlight-heading" className="tr-section-title">
            ✨ Spotlight
          </h2>
          <p className="tr-section-sub">The faces and hands behind the work.</p>
        </div>
      </div>

      {/* Featured hero */}
      {isLoading ? (
        <FeaturedHeroSkeleton />
      ) : featured[0] ? (
        <FeaturedSpotlight person={featured[0]} />
      ) : null}

      {/* Role filter */}
      <RoleFilterTabs activeRole={activeRole} onRoleChange={setActiveRole} />

      {/* Person grid */}
      {isLoading ? (
        <PersonGridSkeleton />
      ) : (
        <PersonGrid persons={persons} />
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TopRatedPage() {
  const [activeSection, setActiveSection] = useState("arena");
  const { data: arenaData, isLoading: arenaLoading } = useArena();

  // ── Scroll spy via IntersectionObserver ───────────────────────────────────
  // Updates active tab as user scrolls between sections.
  // rootMargin bias toward top so tab changes feel immediate.
  useEffect(() => {
    const observers = [];
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(`section-${id}`);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // ── Tab click → smooth scroll to section anchor ───────────────────────────
  const handleTabClick = useCallback((id) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="tr-root">
      {/* Sticky navigation tabs */}
      <ArenaTabs activeSection={activeSection} onTabClick={handleTabClick} />

      {/* ── Section 1: Arena ─────────────────────────────────────────────── */}
      <ArenaSection
        battles={arenaData?.active_battles}
        completedBattles={arenaData?.completed_battles}
        isLoading={arenaLoading}
      />

      {/* Section divider */}
      <div className="tr-divider" aria-hidden="true" />

      {/* ── Section 2: Street Pull leaderboard ───────────────────────────── */}
      <section
        id="section-leaderboard"
        aria-labelledby="leaderboard-heading"
        className="tr-section"
      >
        <div className="tr-section-header">
          <div
            className="tr-section-accent tr-section-accent--amber"
            aria-hidden="true"
          />
          <div>
            <h2 id="leaderboard-heading" className="tr-section-title">
              🔥 Street Pull
            </h2>
            <p className="tr-section-sub">
              Ranked by total engagement — views, votes, plays, ratings.
            </p>
          </div>
        </div>
        <StreetPullLeaderboard />
      </section>

      <div className="tr-divider" aria-hidden="true" />

      {/* ── Section 3: Spotlight ─────────────────────────────────────────── */}
      <SpotlightSection />

      {/* Bottom padding for mobile nav bar clearance */}
      <div className="tr-bottom-pad" aria-hidden="true" />

      <style jsx>{`
        .tr-root {
          min-height: 100vh;
          background: var(--color-kritiq-black, #0a0a0a);
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .tr-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px 0 8px;
        }

        .tr-section-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 0 16px;
        }

        .tr-section-accent {
          width: 3px;
          height: 44px;
          border-radius: 99px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .tr-section-accent--red {
          background: var(--color-kritiq-red, #c0001a);
        }
        .tr-section-accent--amber {
          background: #f59e0b;
        }
        .tr-section-accent--purple {
          background: #8b5cf6;
        }

        .tr-section-title {
          font-family: var(--font-lexend, sans-serif);
          font-size: 22px;
          font-weight: 800;
          color: var(--color-kritiq-white, #fff);
          margin: 0 0 4px;
          line-height: 1.15;
        }
        .tr-section-sub {
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          color: var(--color-kritiq-ash, #888);
          margin: 0;
          line-height: 1.5;
        }

        .tr-divider {
          height: 0.5px;
          background: var(--color-kritiq-dark-3, #1a1a1a);
          margin: 8px 16px;
        }

        .tr-empty {
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          color: var(--color-kritiq-ash, #666);
          text-align: center;
          padding: 32px 16px;
          margin: 0;
        }

        .tr-bottom-pad {
          height: 80px;
        }

        @media (min-width: 768px) {
          .tr-section {
            padding: 32px 0 12px;
          }
          .tr-section-title {
            font-size: 26px;
          }
        }

        @media (min-width: 1024px) {
          .tr-root {
            max-width: 1200px;
            margin: 0 auto;
          }
        }
      `}</style>
    </main>
  );
}

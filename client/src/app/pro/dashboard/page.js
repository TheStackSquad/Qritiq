"use client";

// client/app/pro/dashboard/page.js
// Protected route — requires creator | pro | admin role.
// Fetches dashboard data from the Go backend and renders the Dashboard component.

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import withAuth from "@/middleware/withAuth";
import Dashboard from "@/components/dashboard/index";
import Header from "@/components/common/header/header";
import useAuthStore from "@/sessions/userSessions";
import api from "@/apiClient/tokenRefresh";
import { PRO_ROUTES } from "@/constants/routes";

function ProDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const movieIdParam = searchParams.get("movie");

  const [movies, setMovies] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [selectedId, setSelectedId] = useState(movieIdParam || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Step 1: Load creator's movie list ───────────────────────────
  useEffect(() => {
    async function fetchMovies() {
      try {
        const { data } = await api.get(PRO_ROUTES.MOVIES);
        const list = data?.data || [];
        setMovies(list);
        // Auto-select first movie if none specified
        if (!selectedId && list.length > 0) {
          setSelectedId(list[0].id);
        }
      } catch (err) {
        // If no movies yet, use seed data for presentation
        setMovies(SEED_MOVIES);
        if (!selectedId) setSelectedId(SEED_MOVIES[0].id);
      }
    }
    fetchMovies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 2: Load dashboard data when movie is selected ──────────
  useEffect(() => {
    if (!selectedId) return;

    async function fetchDashboard() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(PRO_ROUTES.DASHBOARD(selectedId));
        setDashData(data?.data || null);
      } catch (err) {
        // Fall back to seed presentation data
        setDashData(getSeedDashboard(selectedId));
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [selectedId]);

  return (
    <>
      <Header />
      <div
        className="pt-16"
        style={{ background: "var(--color-kritiq-black)", minHeight: "100vh" }}
      >
        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <DashboardError message={error} />
        ) : (
          <Dashboard
            initialData={dashData}
            movies={movies}
            user={user}
            onMovieSelect={setSelectedId}
          />
        )}
      </div>
    </>
  );
}

// Wrap with auth guard — requires creator role minimum
export default withAuth(ProDashboardPage, { requiredRole: "creator" });

// ── Loading skeleton ──────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 16px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: "20px",
        }}
      >
        <div
          className="skeleton"
          style={{ height: "300px", borderRadius: "12px" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            className="skeleton"
            style={{ height: "100px", borderRadius: "12px" }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: "20px",
            }}
          >
            <div
              className="skeleton"
              style={{ height: "280px", borderRadius: "12px" }}
            />
            <div
              className="skeleton"
              style={{ height: "280px", borderRadius: "12px" }}
            />
          </div>
          <div
            className="skeleton"
            style={{ height: "240px", borderRadius: "12px" }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────
function DashboardError({ message }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-lexend)",
          color: "var(--color-kritiq-ash)",
          fontSize: "14px",
        }}
      >
        {message || "Failed to load dashboard data."}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-ghost"
        style={{ fontSize: "13px" }}
      >
        Try Again
      </button>
    </div>
  );
}

// ── Seed data — used when API returns no results (presentation) ───
const SEED_MOVIES = [
  {
    id: "seed-atcj2",
    title: "A Tribe Called Judah 2",
    hype_score: 87.4,
    status: "pre_release",
    poster_url: null,
  },
  {
    id: "seed-gol2",
    title: "Gangs of Lagos 2",
    hype_score: 91.2,
    status: "pre_release",
    poster_url: null,
  },
  {
    id: "seed-bol",
    title: "Breath of Life",
    hype_score: 82.1,
    status: "pre_release",
    poster_url: null,
  },
];

function getSeedDashboard(movieId) {
  const movie = SEED_MOVIES.find((m) => m.id === movieId) || SEED_MOVIES[0];
  return {
    movie: {
      ...movie,
      total_hype_votes: 14200,
      days_until_release: 245,
      genre: "Crime/Drama",
      director: "Jade Osiberu",
    },
    hype_score: movie.hype_score,
    total_votes: 14200,
    demography: {
      lagos: { city: "Lagos", count: 5124, percentage: 41 },
      abuja: { city: "Abuja", count: 2001, percentage: 16 },
      enugu: { city: "Enugu", count: 2380, percentage: 19 },
      kano: { city: "Kano", count: 1000, percentage: 8 },
      port_harcourt: { city: "Port Harcourt", count: 1250, percentage: 10 },
      other: { city: "Other", count: 750, percentage: 6 },
    },
    competitors: [
      {
        content_id: "seed-gol2",
        title: "Gangs of Lagos 2",
        hype_score: 91.2,
        total_votes: 22100,
        total_likes: 31000,
        status: "pre_release",
        is_target: false,
      },
      {
        content_id: "seed-atcj2",
        title: "A Tribe Called Judah 2",
        hype_score: 87.4,
        total_votes: 14200,
        total_likes: 18400,
        status: "pre_release",
        is_target: true,
      },
      {
        content_id: "seed-bol",
        title: "Breath of Life",
        hype_score: 82.1,
        total_votes: 11000,
        total_likes: 14200,
        status: "pre_release",
        is_target: false,
      },
      {
        content_id: "seed-tbb2",
        title: "The Black Book 2",
        hype_score: 78.8,
        total_votes: 9800,
        total_likes: 12300,
        status: "pre_release",
        is_target: false,
      },
      {
        content_id: "seed-mimi",
        title: "Mimi",
        hype_score: 61.2,
        total_votes: 6200,
        total_likes: 8900,
        status: "released",
        is_target: false,
      },
    ],
  };
}

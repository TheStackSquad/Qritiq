"use client";

// src/app/(auth)/login/page.js
// Same three-viewport layout as signup:
//   Mobile  (<768px)   — glass card over full-bleed hero
//   Tablet  (768-1023) — hero band top, card overlaps
//   Desktop (1024px+)  — 50/50 sticky hero + form
//
// LoginForm stays in Suspense — it calls useSearchParams() internally.

import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./loginForm";
import AuthHero from "../../../components/auth/authHero";
import { authSharedStyles } from "./authStyles";
import { pwRuleStyles, signupLayoutStyles } from "../signup/styles";

export default function LoginPage() {
  return (
    <div className="signup-root">
      {/* ── Mobile hero background (fixed, full-bleed) ──────── */}
      <div className="mobile-hero-bg" aria-hidden="true">
        <AuthHero />
      </div>

      {/* ── Desktop sticky hero panel ────────────────────────── */}
      <div className="hero-panel">
        <AuthHero />
      </div>

      {/* ── Tablet top hero band ─────────────────────────────── */}
      <div className="tablet-hero-band" aria-hidden="true">
        <AuthHero />
      </div>

      {/* ── Form area ─────────────────────────────────────────── */}
      <div className="form-panel">
        <div className="form-card">
          {/* Logo — visible on mobile + tablet, hidden on desktop */}
          <Link href="/" className="card-logo">
            KritiQ
          </Link>

          {/* LoginForm handles its own heading, fields, submit, links */}
          <Suspense fallback={<LoginLoader />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <style jsx>{`
        ${authSharedStyles}
        ${pwRuleStyles}
        ${signupLayoutStyles}

        /* Login-specific: forgot password link */
        .forgot-link {
          font-family: "Lexend", sans-serif;
          font-size: 0.75rem;
          color: var(--color-kritiq-ash);
          text-decoration: none;
          transition: color 0.15s;
        }
        .forgot-link:hover {
          color: var(--color-kritiq-ember);
        }
      `}</style>
    </div>
  );
}

/* Suspense fallback — matches card width, no layout shift */
function LoginLoader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "40px 0",
        minHeight: "260px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "3px solid rgba(192,0,26,0.15)",
          borderTopColor: "#C0001A",
          animation: "spin 0.75s linear infinite",
        }}
      />
      <p
        style={{
          fontFamily: "'Lexend', sans-serif",
          fontSize: "13px",
          color: "var(--color-kritiq-ash)",
          margin: 0,
        }}
      >
        Loading…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

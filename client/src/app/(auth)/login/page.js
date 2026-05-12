"use client";

// src/app/(auth)/login/page.js
// Imports auth.css directly — NO styled-jsx, no string injection.
// This is why styles weren't applying before: styled-jsx string
// interpolation of imported constants doesn't work in App Router.

import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./loginForm";
import AuthHero from "../../../components/auth/authHero";
import "../auth.css";

export default function LoginPage() {
  return (
    <div className="signup-root">
      {/* ── Suspended carousel panel (left) ─────────── */}
      <div className="hero-panel">
        <AuthHero />
      </div>

      {/* ── Form panel (right) ──────────────────────── */}
      <div className="form-panel">
        <div className="form-card">
          {/* Logo — shown on mobile only (hidden on tablet+) */}
          <Link href="/" className="card-logo">
            KritiQ
          </Link>

          <Suspense fallback={<LoginLoader />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

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
        minHeight: "240px",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          border: "2.5px solid rgba(192,0,26,0.15)",
          borderTopColor: "#C0001A",
          animation: "spin 0.75s linear infinite",
        }}
      />
      <p
        style={{
          fontFamily: "'Lexend', sans-serif",
          fontSize: "12px",
          color: "rgba(255,255,255,0.4)",
          margin: 0,
        }}
      >
        Loading…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

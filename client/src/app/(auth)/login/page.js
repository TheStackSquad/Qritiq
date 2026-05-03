// client/app/(auth)/login/page.js

"use client";

import { Suspense } from "react";
import LoginForm from "@/app/(auth)/login/loginForm";
import HeroPoster from "@/components/auth/heroposter";
import { authSharedStyles } from "./authStyles";

export default function LoginPage() {
  return (
    <div className="auth-page">
      {/* ── Left: cinematic hero panel ── */}
      <div className="auth-hero">
        <HeroPoster />
      </div>

      {/* ── Right: form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <Suspense
            fallback={
              <div className="auth-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <style jsx>{`
        ${authSharedStyles}

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

        /* Loading state styles */
        .auth-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px 0;
        }

        .auth-loading p {
          font-family: "Lexend", sans-serif;
          color: var(--color-kritiq-ash);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(192, 0, 26, 0.2);
          border-top-color: #c0001a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
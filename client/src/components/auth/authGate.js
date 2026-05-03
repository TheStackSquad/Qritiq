// src/components/common/AuthGate.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, LogIn, UserPlus } from "lucide-react";

// ─── Auth gate ────────────────────────────────────────────────────────────────
// Bottom sheet shown when an unauthenticated user taps a vote button.
// Sliding entrance on mount, backdrop click to dismiss.

export default function AuthGate({ isOpen, onClose, message }) {
  const router = useRouter();

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Dismiss on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ag-root"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in required"
    >
      {/* Backdrop */}
      <div className="ag-backdrop" onClick={onClose} />

      {/* Sheet */}
      <div className="ag-sheet">
        {/* Handle */}
        <div className="ag-handle" />

        {/* Close */}
        <button className="ag-close" onClick={onClose} aria-label="Dismiss">
          <X size={18} />
        </button>

        {/* Content */}
        <div className="ag-content">
          <div className="ag-icon">🎬</div>
          <h2 className="ag-title">Sign in to vote</h2>
          <p className="ag-message">
            {message ??
              "Your vote shapes the rating. Sign in to make it count."}
          </p>
        </div>

        {/* Actions */}
        <div className="ag-actions">
          <button
            className="ag-btn ag-btn--primary"
            onClick={() => {
              onClose();
              router.push("/login");
            }}
          >
            <LogIn size={16} strokeWidth={2} />
            Sign In
          </button>
          <button
            className="ag-btn ag-btn--secondary"
            onClick={() => {
              onClose();
              router.push("/register");
            }}
          >
            <UserPlus size={16} strokeWidth={2} />
            Create Account
          </button>
        </div>
      </div>

      <style jsx>{`
        /* ── Root ─────────────────────────────────────────────── */

        .ag-root {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: flex-end;
        }

        /* ── Backdrop ─────────────────────────────────────────── */

        .ag-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: ag-fade 200ms ease;
        }

        @keyframes ag-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* ── Sheet ────────────────────────────────────────────── */

        .ag-sheet {
          position: relative;
          z-index: 1;
          width: 100%;
          background: var(--color-kritiq-dark-1);
          border-top: 1px solid var(--color-kritiq-dark-3);
          border-radius: 20px 20px 0 0;
          padding: 12px 24px 48px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: ag-slide 250ms cubic-bezier(0.32, 0.72, 0, 1);
        }

        @keyframes ag-slide {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        /* ── Handle ───────────────────────────────────────────── */

        .ag-handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: var(--color-kritiq-dark-3);
          margin: 0 auto 4px;
          flex-shrink: 0;
        }

        /* ── Close ────────────────────────────────────────────── */

        .ag-close {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: var(--color-kritiq-dark-2);
          color: var(--color-kritiq-ash);
          cursor: pointer;
          transition: background 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .ag-close:hover {
          background: var(--color-kritiq-dark-3);
        }

        /* ── Content ──────────────────────────────────────────── */

        .ag-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          padding-top: 8px;
        }

        .ag-icon {
          font-size: 2rem;
          line-height: 1;
        }

        .ag-title {
          font-family: var(--font-clash);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-kritiq-white);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .ag-message {
          font-family: var(--font-lexend);
          font-size: 13px;
          color: var(--color-kritiq-ash);
          margin: 0;
          max-width: 280px;
          line-height: 1.5;
        }

        /* ── Actions ──────────────────────────────────────────── */

        .ag-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ag-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          border-radius: var(--radius-pill);
          border: none;
          font-family: var(--font-lexend);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition:
            opacity 150ms ease,
            transform 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .ag-btn:active {
          transform: scale(0.97);
        }

        .ag-btn--primary {
          background: var(--color-kritiq-ember);
          color: #fff;
        }

        .ag-btn--primary:hover {
          opacity: 0.9;
        }

        .ag-btn--secondary {
          background: var(--color-kritiq-dark-2);
          color: var(--color-kritiq-silver);
          border: 1px solid var(--color-kritiq-dark-3);
        }

        .ag-btn--secondary:hover {
          background: var(--color-kritiq-dark-3);
        }
      `}</style>
    </div>
  );
}

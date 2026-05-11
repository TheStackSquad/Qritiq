"use client";

// src/app/(auth)/signup/page.js
// Three distinct layouts:
//   Mobile  (<768px)  — glass card floats over full-bleed blurred hero
//   Tablet  (768-1023px) — hero top band, form card overlaps from below
//   Desktop (1024px+) — 50/50 split, sticky slideshow left, form right

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import useAuthStore from "../../../sessions/userSessions";
import { signupAPI } from "../../../services/loginApi";
import AuthHero from "../../../components/auth/authHero";
import SignupFields from "./signupFields";
import { RULES } from "./passwordRules";
import { authSharedStyles } from "../login/authStyles";
import { pwRuleStyles, signupLayoutStyles } from "./styles";

export default function SignupPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const allRulesPassed = RULES.every((r) => r.test(form.password));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!allRulesPassed) {
      setError("Please meet all password requirements.");
      return;
    }
    setLoading(true);
    try {
      const data = await signupAPI(form);
      setSession(data);
      router.push("/");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-root">
      {/* ── Mobile hero background (hidden on tablet+) ─────── */}
      <div className="mobile-hero-bg" aria-hidden="true">
        <AuthHero />
      </div>

      {/* ── Desktop / Tablet hero panel ──────────────────────── */}
      <div className="hero-panel">
        <AuthHero />
      </div>

      {/* ── Tablet hero band (top strip) ─────────────────────── */}
      <div className="tablet-hero-band" aria-hidden="true">
        <AuthHero />
      </div>

      {/* ── Form area ─────────────────────────────────────────── */}
      <div className="form-panel">
        <div className="form-card">
          {/* Mobile logo inside card */}
          <Link href="/" className="card-logo">
            KritiQ
          </Link>

          <div className="auth-heading">
            <h1>Join the movement</h1>
            <p>
              Rate films and music before they drop.
              <br />
              Your voice shapes culture.
            </p>
          </div>

          <form onSubmit={onSubmit} className="auth-form" noValidate>
            <SignupFields form={form} onChange={onChange} loading={loading} />

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn-submit"
              disabled={
                loading || (form.password.length > 0 && !allRulesPassed)
              }
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Creating account…
                </>
              ) : (
                "Create free account"
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>

          <p className="auth-legal">
            By signing up you agree to our <Link href="/terms">Terms</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <style jsx>{`
        ${authSharedStyles}
        ${pwRuleStyles}
        ${signupLayoutStyles}
      `}</style>
    </div>
  );
}

// src/app/(auth)/login/loginForm.js
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import useAuthStore from "@/sessions/userSessions";
import { loginAPI } from "@/services/loginApi";
import { resolveRedirect } from "@/utils/hooks/resolveRedirect";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect param from URL (e.g., /login?redirect=/movies/some-movie)
  const redirectPath = searchParams.get("redirect") || "/";
  const setSession = useAuthStore((s) => s.setSession);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Sanitize input to avoid strict backend binding errors
    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    try {
      const data = await loginAPI(payload);

      // 1. Clear form immediately on success
      setForm({ email: "", password: "" });

      // 2. Persist session (Zustand + Cookies)
      setSession(data);

      // 3. Navigate using centralized redirect logic
      const destination = resolveRedirect(redirectPath, data.user?.role);
      router.push(destination);
    } catch (err) {
      const message = err.response?.data?.error || "Invalid email or password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile-only logo */}
      <Link href="/" className="auth-mobile-logo">
        KritiQ
      </Link>

      <div className="auth-heading">
        <h1>Welcome back</h1>
        <p>Sign in to rate, hype, and track Nollywood &amp; Afrobeats.</p>
      </div>

      <form onSubmit={onSubmit} className="auth-form" noValidate>
        {/* Email */}
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
            className={error ? "input-error" : ""}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="field">
          <div className="field-label-row">
            <label htmlFor="password">Password</label>
            <Link href="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
          <div className="input-icon-wrap">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              className={error ? "input-error" : ""}
              disabled={loading}
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && <p className="form-error">{error}</p>}

        {/* Submit */}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="auth-switch">
        Don&apos;t have an account? <Link href="/signup">Create one free</Link>
      </p>

      <p className="auth-legal">
        By signing in you agree to our <Link href="/terms">Terms</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </>
  );
}

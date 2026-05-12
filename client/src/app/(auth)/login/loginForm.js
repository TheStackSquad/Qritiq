"use client";

// src/app/(auth)/login/loginForm.js
// suppressHydrationWarning on inputs/buttons kills the fdprocessedid
// hydration mismatch caused by password-manager browser extensions.

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import useAuthStore from "../../../sessions/userSessions";
import { loginAPI } from "../../../services/loginApi";
import { resolveRedirect } from "../../../utils/hooks/resolveRedirect";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };
    try {
      const data = await loginAPI(payload);
      setForm({ email: "", password: "" });
      setSession(data);
      const destination = resolveRedirect(redirectPath, data.user?.role);
      router.push(destination);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-heading">
        <h1>Welcome back</h1>
        <p>Sign in to rate, hype, and track Nollywood &amp; Afrobeats.</p>
      </div>

      <form onSubmit={onSubmit} className="auth-form" noValidate>
        {/* Email */}
        <div className="field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
            className={error ? "input-error" : ""}
            disabled={loading}
            suppressHydrationWarning
          />
        </div>

        {/* Password */}
        <div className="field">
          <div className="field-label-row">
            <label htmlFor="login-password">Password</label>
            <Link href="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
          <div className="input-icon-wrap">
            <input
              id="login-password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              className={error ? "input-error" : ""}
              disabled={loading}
              suppressHydrationWarning
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              suppressHydrationWarning
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p className="form-error">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
          suppressHydrationWarning
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin" /> Signing in…
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

"use client";

// src/app/(auth)/signup/signupFields.js
// suppressHydrationWarning on inputs/buttons silences the fdprocessedid
// noise from password-manager browser extensions.

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PasswordRuleList } from "./passwordRules";

export default function SignupFields({ form, onChange, loading }) {
  const [showPw, setShowPw] = useState(false);

  return (
    <>
      {/* Email */}
      <div className="field">
        <label htmlFor="signup-email">Email address</label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={onChange}
          disabled={loading}
          suppressHydrationWarning
        />
      </div>

      {/* Username */}
      <div className="field">
        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={100}
          placeholder="your_handle"
          value={form.username}
          onChange={onChange}
          disabled={loading}
          suppressHydrationWarning
        />
      </div>

      {/* Password */}
      <div className="field">
        <label htmlFor="signup-password">Password</label>
        <div className="input-icon-wrap">
          <input
            id="signup-password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={onChange}
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

        <PasswordRuleList password={form.password} />
      </div>
    </>
  );
}

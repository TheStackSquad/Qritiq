// client/app/(auth)/signup/signupFields.js
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PasswordRuleList } from "./passwordRules";

export default function SignupFields({ form, onChange, loading }) {
  const [showPw, setShowPw] = useState(false);

  return (
    <>
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
          disabled={loading}
        />
      </div>

      {/* Username */}
      <div className="field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
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
        />
      </div>

      {/* Password */}
      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="input-icon-wrap">
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={onChange}
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

        {/* Strength checklist */}
        <PasswordRuleList password={form.password} />
      </div>
    </>
  );
}

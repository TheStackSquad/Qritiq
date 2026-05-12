"use client";

// src/app/(auth)/login/authStyles.js
// authSharedStyles: form-level atoms only.
// Layout (hero/form split, card, mobile overlay) lives in signup/styles.js.

export const authSharedStyles = `
  /* ─── Heading ─────────────────────────────────────── */
  .auth-heading h1 {
    font-family: 'Clash Grotesk', sans-serif;
    font-weight: 700;
    font-size: clamp(1.55rem, 4vw, 1.95rem);
    letter-spacing: -0.03em;
    color: #fff;
    margin: 0 0 5px;
  }
  .auth-heading p {
    font-family: 'Lexend', sans-serif;
    font-size: 0.875rem;
    color: rgba(255,255,255,0.45);
    margin: 0;
    line-height: 1.55;
  }

  /* ─── Form ────────────────────────────────────────── */
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
  }

  .field-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .field label {
    font-family: 'Lexend', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    color: rgba(255,255,255,0.7);
    margin-bottom: 6px;
    display: block;
    transition: color 0.2s;
    animation: labelSlide 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }
  .field:nth-child(1) label { animation-delay: 0.05s; }
  .field:nth-child(2) label { animation-delay: 0.1s; }
  .field:nth-child(3) label { animation-delay: 0.15s; }

  @keyframes labelSlide {
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .field:focus-within label {
    color: rgba(192,0,26,0.85);
  }

  .field input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    padding: 11px 14px;
    color: #fff;
    font-family: 'Lexend', sans-serif;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    width: 100%;
    box-sizing: border-box;
  }

  .field input::placeholder {
    color: rgba(255,255,255,0.18);
    transition: opacity 0.25s;
  }
  .field input:focus::placeholder {
    opacity: 0.5;
  }

  .field input:focus {
    border-color: rgba(192,0,26,0.55);
    box-shadow: 0 0 0 3px rgba(192,0,26,0.12), 0 0 10px rgba(192,0,26,0.07);
    background: rgba(255,255,255,0.07);
  }

  .field input.input-error {
    border-color: rgba(239,68,68,0.5);
  }

  .field input:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ─── Password toggle ─────────────────────────────── */
  .input-icon-wrap { position: relative; }
  .input-icon-wrap input { padding-right: 44px; }

  .pw-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.45);
    display: flex;
    align-items: center;
    padding: 0;
    transition: color 0.15s;
  }
  .pw-toggle:hover { color: rgba(255,255,255,0.7); }

  /* ─── Error ───────────────────────────────────────── */
  .form-error {
    font-family: 'Lexend', sans-serif;
    font-size: 0.78rem;
    color: #ef4444;
    margin: 0;
    padding: 9px 12px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 12px;
  }

  /* ─── Submit ──────────────────────────────────────── */
  .btn-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    font-family: 'Lexend', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    background: linear-gradient(135deg, #c0001a 0%, #e8001f 100%);
    color: #fff;
    transition: opacity 0.15s, transform 0.12s, box-shadow 0.15s;
    box-shadow: 0 4px 20px rgba(192,0,26,0.3);
    letter-spacing: 0.01em;
  }
  .btn-submit:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(192,0,26,0.44);
  }
  .btn-submit:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 16px rgba(192,0,26,0.28);
  }
  .btn-submit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ─── Spinner ─────────────────────────────────────── */
  .spin { animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ─── Switch / Legal ──────────────────────────────── */
  .auth-switch {
    font-family: 'Lexend', sans-serif;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.45);
    text-align: center;
    margin: 0;
  }
  .auth-switch a {
    color: #c0001a;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.15s;
  }
  .auth-switch a:hover { opacity: 0.75; }

  .auth-legal {
    font-family: 'Lexend', sans-serif;
    font-size: 0.72rem;
    color: rgba(255,255,255,0.2);
    text-align: center;
    margin: 0;
    line-height: 1.6;
  }
  .auth-legal a {
    color: rgba(255,255,255,0.32);
    text-decoration: none;
    transition: color 0.15s;
  }
  .auth-legal a:hover { color: rgba(255,255,255,0.5); }

  /* ─── Forgot password ─────────────────────────────── */
  .forgot-link {
    font-family: 'Lexend', sans-serif;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.45);
    text-decoration: none;
    transition: color 0.15s;
  }
  .forgot-link:hover { color: #c0001a; }
`;

// src/app/(auth)/signup/styles.js
// ─────────────────────────────────────────────────────────────────────────────
// THREE-VIEWPORT AUTH LAYOUT  (signup + login share this)
//
//  Mobile  <768px   — carousel fills viewport behind dimmed glass form
//  Tablet  768-1023px — side-by-side narrow split (carousel 42%, form 58%)
//  Desktop 1024px+  — 50/50 split, carousel "suspended card" left, form right
//
// KEY DESIGN RULES
//  • Form content never requires a scroll — everything fits in 100dvh
//  • Carousel panel has contrasting bg (dark charcoal) vs form panel (deep black)
//  • Carousel panel has bold rounded edges — "suspended" card feel on desktop
//  • Inputs + submit share the same border-radius token (--r-input: 12px)
//  • Subtle label float animation + placeholder fade on focus
//  • Lighthouse: will-change only on animated elements, no layout-shift bg imgs
// ─────────────────────────────────────────────────────────────────────────────

export const pwRuleStyles = `
  .pw-rules {
    list-style: none;
    margin: 8px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .pw-rule {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Lexend', sans-serif;
    font-size: 0.72rem;
    color: rgba(255,255,255,0.3);
    transition: color 0.25s;
  }
  .pw-rule svg {
    flex-shrink: 0;
    color: rgba(255,255,255,0.2);
    transition: color 0.25s;
  }
  .pw-rule--pass     { color: #4ade80; }
  .pw-rule--pass svg { color: #4ade80; }
`;

export const signupLayoutStyles = `

  /* ─── Design tokens ──────────────────────────────── */
  :root {
    --r-carousel: 24px;   /* carousel panel corner radius */
    --r-input:    12px;   /* inputs + button radius       */
    --col-bg:     #080808;
    --col-panel:  #111113; /* carousel contrasting surface */
    --col-ember:  #c0001a;
    --col-ash:    rgba(255,255,255,0.45);
    --col-silver: rgba(255,255,255,0.7);
    --col-border: rgba(255,255,255,0.07);
    --col-input-bg: rgba(255,255,255,0.05);
  }

  /* ─── Root ───────────────────────────────────────── */
  .signup-root {
    position: relative;
    width: 100%;
    height: 100dvh;          /* exact viewport, no scroll */
    overflow: hidden;
    background: var(--col-bg);
    display: flex;
    flex-direction: column;
  }

  /* ═══════════════════════════════════════════════════
     MOBILE  <768px
     Carousel fills full screen behind the form card.
     Form card is centred over it with a glass overlay.
  ═══════════════════════════════════════════════════ */

  /* Full-screen carousel background */
  .hero-panel {
    position: fixed;
    inset: 0;
    z-index: 0;
  }

  /* Form panel sits on top */
  .form-panel {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 16px;
    height: 100dvh;
    box-sizing: border-box;
    /* Dim the carousel behind form on mobile */
    background: rgba(5,5,5,0.62);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  /* Glass card — mobile */
  .form-card {
    width: 100%;
    max-width: 390px;
    background: rgba(10,10,10,0.88);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(255,255,255,0.08);
    border-top: 1.5px solid rgba(192,0,26,0.5);
    border-radius: 20px;
    padding: 28px 24px 24px;
    box-shadow:
      0 0 0 1px rgba(192,0,26,0.07),
      0 24px 64px rgba(0,0,0,0.7),
      0 0 40px rgba(192,0,26,0.05);
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: cardMount 0.42s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes cardMount {
    from { opacity: 0; transform: translateY(18px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  /* Mobile logo */
  .card-logo {
    font-family: 'Clash Grotesk', sans-serif;
    font-weight: 700;
    font-size: 1.55rem;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #e8001f, #ff4433);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
    display: block;
    line-height: 1;
  }

  /* Tablet hero band — unused in new layout */
  .tablet-hero-band { display: none; }
  .mobile-hero-bg   { display: none; }

  /* ═══════════════════════════════════════════════════
     TABLET  768-1023px
     Side-by-side. Carousel left (42%), form right (58%).
     Carousel still has the suspended card look.
  ═══════════════════════════════════════════════════ */
  @media (min-width: 768px) {

    .signup-root {
      flex-direction: row;
      overflow: hidden;
    }

    /* Carousel "suspended" panel */
    .hero-panel {
      position: relative;
      flex: 0 0 42%;
      height: 100dvh;
      /* The "suspended" card sits inside with margin */
      padding: 16px;
      box-sizing: border-box;
      background: var(--col-bg); /* outer bg matches form bg */
      z-index: 1;
    }

    /* Inner container — this is the visually "suspended" card */
    .hero-panel > * {
      border-radius: var(--r-carousel) !important;
      overflow: hidden !important;
      height: 100% !important;
      width: 100% !important;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.06),
        0 20px 60px rgba(0,0,0,0.6),
        inset 0 0 0 1px rgba(255,255,255,0.03);
    }

    /* Form panel */
    .form-panel {
      flex: 1;
      height: 100dvh;
      padding: 0 32px;
      background: var(--col-bg);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border-left: 1px solid var(--col-border);
      overflow-y: auto;
      /* Center vertically */
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Opaque card on tablet */
    .form-card {
      max-width: 420px;
      background: transparent;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border: none;
      border-radius: 0;
      padding: 0;
      box-shadow: none;
      animation: none;
    }

    /* Hide logo — hero panel has its own */
    .card-logo { display: none; }
  }

  /* ═══════════════════════════════════════════════════
     DESKTOP  1024px+
     Carousel panel 45%, form panel 55%.
     More generous padding, larger suspended card margin.
  ═══════════════════════════════════════════════════ */
  @media (min-width: 1024px) {

    .hero-panel {
      flex: 0 0 45%;
      padding: 20px;
    }

    .form-panel {
      flex: 1;
      padding: 0 64px;
    }

    .form-card {
      max-width: 440px;
    }
  }

  /* ─── Headings ───────────────────────────────────── */
  .auth-heading h1 {
    font-family: 'Clash Grotesk', sans-serif;
    font-weight: 700;
    font-size: clamp(1.6rem, 4vw, 2rem);
    letter-spacing: -0.03em;
    color: #fff;
    margin: 0 0 5px;
  }
  .auth-heading p {
    font-family: 'Lexend', sans-serif;
    font-size: 0.875rem;
    color: var(--col-ash);
    margin: 0;
    line-height: 1.55;
  }

  /* ─── Form ───────────────────────────────────────── */
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

  /* Label — subtle slide-down animation on page mount */
  .field label {
    font-family: 'Lexend', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--col-silver);
    margin-bottom: 6px;
    display: block;
    transition: color 0.2s;
    animation: labelSlide 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }
  .field:nth-child(1) label { animation-delay: 0.05s; }
  .field:nth-child(2) label { animation-delay: 0.1s;  }
  .field:nth-child(3) label { animation-delay: 0.15s; }

  @keyframes labelSlide {
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  /* Input */
  .field input {
    background: var(--col-input-bg);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: var(--r-input);
    padding: 11px 14px;
    color: #fff;
    font-family: 'Lexend', sans-serif;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    width: 100%;
    box-sizing: border-box;
  }

  /* Placeholder fade-in */
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

  /* Focus label highlight */
  .field:focus-within label {
    color: rgba(192,0,26,0.85);
  }

  .field input.input-error {
    border-color: rgba(239,68,68,0.5);
  }

  .field input:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ─── Password toggle ────────────────────────────── */
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
    color: var(--col-ash);
    display: flex;
    align-items: center;
    padding: 0;
    transition: color 0.15s;
  }
  .pw-toggle:hover { color: var(--col-silver); }

  /* ─── Error ──────────────────────────────────────── */
  .form-error {
    font-family: 'Lexend', sans-serif;
    font-size: 0.78rem;
    color: #ef4444;
    margin: 0;
    padding: 9px 12px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: var(--r-input);
  }

  /* ─── Submit button ──────────────────────────────── */
  .btn-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 13px;
    border-radius: var(--r-input);
    border: none;
    cursor: pointer;
    font-family: 'Lexend', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    background: linear-gradient(135deg, #c0001a 0%, #e8001f 100%);
    color: #fff;
    transition: opacity 0.15s, transform 0.12s, box-shadow 0.15s;
    box-shadow: 0 4px 20px rgba(192,0,26,0.32);
    letter-spacing: 0.01em;
  }
  .btn-submit:hover:not(:disabled) {
    opacity: 0.93;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(192,0,26,0.45);
  }
  .btn-submit:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 18px rgba(192,0,26,0.3);
  }
  .btn-submit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ─── Spinner ────────────────────────────────────── */
  .spin { animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ─── Switch / Legal ─────────────────────────────── */
  .auth-switch {
    font-family: 'Lexend', sans-serif;
    font-size: 0.85rem;
    color: var(--col-ash);
    text-align: center;
    margin: 0;
  }
  .auth-switch a {
    color: var(--color-kritiq-ember, #c0001a);
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
  .auth-legal a:hover { color: var(--col-ash); }

  /* ─── Forgot password link ───────────────────────── */
  .forgot-link {
    font-family: 'Lexend', sans-serif;
    font-size: 0.75rem;
    color: var(--col-ash);
    text-decoration: none;
    transition: color 0.15s;
  }
  .forgot-link:hover { color: var(--color-kritiq-ember, #c0001a); }
`;

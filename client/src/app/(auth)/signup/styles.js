// src/app/(auth)/signup/styles.js
// Three-viewport layout for signup (and login) auth pages.
// Mobile  < 768px   — glass card over full-bleed hero
// Tablet  768-1023px— hero top band, form card overlaps
// Desktop 1024px+   — 50/50 sticky hero + form

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
    font-size: 0.75rem;
    color: rgba(255,255,255,0.3);
    transition: color 0.2s;
  }
  .pw-rule svg {
    flex-shrink: 0;
    color: rgba(255,255,255,0.2);
    transition: color 0.2s;
  }
  .pw-rule--pass     { color: #4ade80; }
  .pw-rule--pass svg { color: #4ade80; }
`;

export const signupLayoutStyles = `

  /* ════════════════════════════════════════════════════
     ROOT — stacks all layers
  ════════════════════════════════════════════════════ */
  .signup-root {
    position: relative;
    min-height: 100vh;
    background: var(--color-kritiq-black);
    display: flex;
    flex-direction: column;
  }

  /* ════════════════════════════════════════════════════
     MOBILE  (< 768px)
     Full-viewport blurred hero bg.
     Glass form card centred over it.
  ════════════════════════════════════════════════════ */

  /* Full-screen hero behind everything */
  .mobile-hero-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    display: block;
  }
  /* Dark + blur scrim so form stays readable */
  .mobile-hero-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(5,5,5,0.72);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  /* Tablet hero band — hidden on mobile */
  .tablet-hero-band { display: none; }

  /* Desktop hero panel — hidden on mobile */
  .hero-panel { display: none; }

  /* Form panel — scrollable over the fixed bg */
  .form-panel {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px 60px;
    min-height: 100vh;
  }

  /* Glass card — mobile */
  .form-card {
    width: 100%;
    max-width: 400px;
    background: rgba(13,13,13,0.82);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.07);
    border-top: 2px solid rgba(192,0,26,0.55);
    border-radius: 18px;
    padding: 36px 28px 32px;
    box-shadow:
      0 0 0 1px rgba(192,0,26,0.08),
      0 32px 80px rgba(0,0,0,0.65),
      0 0 60px rgba(192,0,26,0.06);
    display: flex;
    flex-direction: column;
    gap: 22px;
    /* Mount animation */
    animation: cardMount 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
  }

  @keyframes cardMount {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  /* Logo inside card (all viewports except desktop) */
  .card-logo {
    font-family: 'Clash Grotesk', sans-serif;
    font-weight: 700;
    font-size: 1.65rem;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #e8001f, #ff4433);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
    display: block;
    line-height: 1;
  }

  /* ════════════════════════════════════════════════════
     TABLET  (768px – 1023px)
     Hero band occupies top 42vh.
     Form card slides up and overlaps the band.
  ════════════════════════════════════════════════════ */
  @media (min-width: 768px) and (max-width: 1023px) {

    .signup-root {
      flex-direction: column;
    }

    /* Hide mobile fixed bg */
    .mobile-hero-bg { display: none; }

    /* Hero band */
    .tablet-hero-band {
      display: block;
      width: 100%;
      height: 42vh;
      min-height: 280px;
      flex-shrink: 0;
      position: relative;
    }

    /* Form panel overlaps the band by 60px */
    .form-panel {
      min-height: auto;
      padding: 0 24px 60px;
      margin-top: -60px;
      align-items: flex-start;
    }

    /* Card — slightly wider on tablet */
    .form-card {
      max-width: 480px;
      margin: 0 auto;
      padding: 40px 36px 36px;
      /* Slightly more opaque on tablet — no fixed bg behind */
      background: rgba(10,10,10,0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
  }

  /* ════════════════════════════════════════════════════
     DESKTOP  (1024px+)
     50 / 50 split. Sticky hero left. Form right.
     Logo lives in the hero — hide card logo.
  ════════════════════════════════════════════════════ */
  @media (min-width: 1024px) {

    .signup-root {
      flex-direction: row;
      min-height: 100vh;
    }

    /* Hide mobile + tablet hero panels */
    .mobile-hero-bg  { display: none; }
    .tablet-hero-band { display: none; }

    /* Sticky hero — left 48% */
    .hero-panel {
      display: block;
      position: sticky;
      top: 0;
      width: 48%;
      flex-shrink: 0;
      height: 100vh;
    }

    /* Form panel — right 52% */
    .form-panel {
      width: 52%;
      min-height: 100vh;
      padding: 60px 48px;
      background: var(--color-kritiq-black);
      /* Subtle left border — separation line */
      border-left: 1px solid rgba(255,255,255,0.04);
    }

    /* Desktop card — no glass, no border, just centered content */
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

    /* Hide card logo on desktop — hero panel has its own */
    .card-logo { display: none; }
  }

  /* ════════════════════════════════════════════════════
     MICRO-INTERACTIONS
     CSS only — no JS, no library
  ════════════════════════════════════════════════════ */

  /* Input focus — red glow pulse */
  .field input:focus {
    border-color: rgba(192,0,26,0.55) !important;
    box-shadow: 0 0 0 3px rgba(192,0,26,0.12), 0 0 12px rgba(192,0,26,0.08) !important;
  }

  /* Submit button — lift + deepen glow */
  .btn-submit:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 32px rgba(192,0,26,0.45) !important;
    opacity: 1 !important;
  }

  .btn-submit:active:not(:disabled) {
    transform: translateY(0) !important;
    box-shadow: 0 4px 20px rgba(192,0,26,0.3) !important;
  }
`;

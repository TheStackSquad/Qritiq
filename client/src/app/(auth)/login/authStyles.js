//client/app/(auth)/login/authStyles.js

export const authSharedStyles = `
  .auth-page {
    display: flex;
    min-height: 100vh;
    background: var(--color-kritiq-black);
  }

  /* Hero panel — hidden on mobile, 45% on desktop */
  .auth-hero {
    display: none;
    position: sticky;
    top: 0;
    height: 100vh;
    width: 45%;
    flex-shrink: 0;
  }
  @media (min-width: 900px) {
    .auth-hero { display: block; }
  }

  /* Form panel */
  .auth-form-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    overflow-y: auto;
  }

  .auth-form-inner {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Mobile logo — only visible when hero panel is hidden */
  .auth-mobile-logo {
    font-family: 'Clash Grotesk', sans-serif;
    font-weight: 700;
    font-size: 1.75rem;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #E8001F, #FF4433);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
    display: block;
  }
  @media (min-width: 900px) {
    .auth-mobile-logo { display: none; }
  }

  /* Heading */
  .auth-heading h1 {
    font-family: 'Clash Grotesk', sans-serif;
    font-weight: 700;
    font-size: 1.875rem;
    letter-spacing: -0.03em;
    color: var(--color-kritiq-white);
    margin: 0 0 6px;
  }
  .auth-heading p {
    font-family: 'Lexend', sans-serif;
    font-size: 0.9rem;
    color: var(--color-kritiq-ash);
    margin: 0;
    line-height: 1.5;
  }

  /* Form */
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .field label {
    font-family: 'Lexend', sans-serif;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-kritiq-silver);
  }

  .field input {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 11px 14px;
    color: var(--color-kritiq-white);
    font-family: 'Lexend', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    width: 100%;
    box-sizing: border-box;
  }

  .field input::placeholder {
    color: rgba(255,255,255,0.2);
  }

  .field input:focus {
    border-color: rgba(192,0,26,0.5);
    box-shadow: 0 0 0 3px rgba(192,0,26,0.12);
  }

  .field input.input-error {
    border-color: rgba(239,68,68,0.5);
  }

  .field input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Password toggle */
  .input-icon-wrap {
    position: relative;
  }
  .input-icon-wrap input {
    padding-right: 42px;
  }
  .pw-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-kritiq-ash);
    display: flex;
    align-items: center;
    padding: 0;
    transition: color 0.15s;
  }
  .pw-toggle:hover { color: var(--color-kritiq-silver); }

  /* Error */
  .form-error {
    font-family: 'Lexend', sans-serif;
    font-size: 0.8125rem;
    color: #ef4444;
    margin: 0;
    padding: 10px 12px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px;
  }

  /* Submit button */
  .btn-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Lexend', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    background: linear-gradient(135deg, #C0001A, #E8001F);
    color: #fff;
    transition: opacity 0.15s, transform 0.1s;
    box-shadow: 0 4px 20px rgba(192,0,26,0.3);
  }
  .btn-submit:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(192,0,26,0.4);
  }
  .btn-submit:active:not(:disabled) { transform: translateY(0); }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Spinner */
  .spin {
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Switch link */
  .auth-switch {
    font-family: 'Lexend', sans-serif;
    font-size: 0.875rem;
    color: var(--color-kritiq-ash);
    text-align: center;
    margin: 0;
  }
  .auth-switch a {
    color: var(--color-kritiq-ember);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.15s;
  }
  .auth-switch a:hover { opacity: 0.8; }

  /* Legal */
  .auth-legal {
    font-family: 'Lexend', sans-serif;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.2);
    text-align: center;
    margin: 0;
    line-height: 1.6;
  }
  .auth-legal a {
    color: rgba(255,255,255,0.35);
    text-decoration: none;
    transition: color 0.15s;
  }
  .auth-legal a:hover { color: var(--color-kritiq-ash); }
`;
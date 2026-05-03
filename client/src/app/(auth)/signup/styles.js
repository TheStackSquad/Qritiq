// client/app/(auth)/signup/styles.js
// Shared between login/page.js and signup/page.js

export const authSharedStyles = `
  /* Re-export from login so both pages stay in sync */
`;

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
    color: rgba(255, 255, 255, 0.3);
    transition: color 0.2s;
  }
  .pw-rule svg {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.2);
    transition: color 0.2s;
  }
  .pw-rule--pass       { color: #4ade80; }
  .pw-rule--pass svg   { color: #4ade80; }
`;

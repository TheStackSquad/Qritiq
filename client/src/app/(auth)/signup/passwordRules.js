// client/app/(auth)/signup/passwordRules.js
import { Check, X } from "lucide-react";

export const RULES = [
  { id: "len", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "num", label: "One number", test: (p) => /\d/.test(p) },
];

export function PasswordRule({ label, passed }) {
  return (
    <li className={`pw-rule ${passed ? "pw-rule--pass" : ""}`}>
      {passed ? (
        <Check size={11} strokeWidth={3} />
      ) : (
        <X size={11} strokeWidth={3} />
      )}
      {label}
    </li>
  );
}

export function PasswordRuleList({ password }) {
  if (!password.length) return null;
  return (
    <ul className="pw-rules">
      {RULES.map((r) => (
        <PasswordRule key={r.id} label={r.label} passed={r.test(password)} />
      ))}
    </ul>
  );
}

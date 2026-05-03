"use client";

import Link from "next/link";

const SOCIALS = [
  { label: "X / Twitter", href: "https://twitter.com/KritiQapp", icon: "𝕏" },
  { label: "Instagram", href: "https://instagram.com/kritiqapp", icon: "◉" },
  { label: "TikTok", href: "https://tiktok.com/@kritiqapp", icon: "♪" },
];

export default function FooterBrand() {
  return (
    <div className="flex flex-col gap-5">
      {/* Logo */}
      <Link href="/" className="inline-block w-fit">
        <span
          className="font-clash font-bold text-2xl tracking-tight"
          style={{
            background: "linear-gradient(135deg, #E8001F, #FF4433)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          KritiQ
        </span>
      </Link>

      {/* Tagline */}
      <p
        style={{
          color: "var(--color-kritiq-ash)",
          fontSize: "14px",
          lineHeight: "1.6",
          maxWidth: "240px",
        }}
      >
        Nigeria&apos;s pulse on Nollywood &amp; Afrobeats. Rate it before it
        drops.
      </p>

      {/* Social icons — CSS hover via .social-icon class */}
      <div className="flex items-center gap-3">
        {SOCIALS.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="social-icon"
          >
            {icon}
          </a>
        ))}
      </div>

      <style jsx>{`
        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition:
            border-color 0.15s,
            color 0.15s;
          background: var(--color-kritiq-dark-2);
          border: 1px solid var(--color-kritiq-dark-3);
          color: var(--color-kritiq-silver);
        }
        .social-icon:hover {
          border-color: rgba(192, 0, 26, 0.4);
          color: var(--color-kritiq-white);
        }
      `}</style>
    </div>
  );
}

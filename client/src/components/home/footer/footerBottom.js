//client/components/home/footer/footerBottom.js
"use client";

import Link from "next/link";

export default function FooterBottom() {
  const year = new Date().getFullYear();

  return (
    <div
      className="border-t"
      style={{ borderColor: "var(--color-kritiq-dark-3)" }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 py-5
                      flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <p
          className="text-xs text-center sm:text-left"
          style={{ color: "var(--color-kritiq-ash)" }}
        >
          &copy; {year} KritiQ. Built for Nollywood &amp; Afrobeats.
        </p>

        <div className="flex items-center gap-4">
          {[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Contact", href: "/contact" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs transition-colors"
              style={{ color: "var(--color-kritiq-ash)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-kritiq-silver)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-kritiq-ash)")
              }
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


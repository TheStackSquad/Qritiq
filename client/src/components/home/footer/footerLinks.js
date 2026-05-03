//client/components/home/footer/footerLinks.js
"use client";

import Link from "next/link";

const COLUMNS = [
  {
    heading: "Discover",
    links: [
      { label: "Movies", href: "/movies" },
      { label: "Music", href: "/music" },
      { label: "Trending Now", href: "/trending" },
      { label: "Top Rated", href: "/top-rated" },
      { label: "Pre-Release", href: "/upcoming" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About KritiQ", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "For Producers", href: "/pro" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
];

export default function FooterLinks() {
  return (
    <div className="grid grid-cols-2 gap-8">
      {COLUMNS.map(({ heading, links }) => (
        <div key={heading}>
          <h3 className="font-lexend font-semibold text-sm uppercase tracking-widest mb-4 text-kritiq-silver">
            {heading}
          </h3>
          <ul className="space-y-2.5">
            {links.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-kritiq-ash hover:text-kritiq-white transition-colors duration-150"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
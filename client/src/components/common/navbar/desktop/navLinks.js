//client/src/components/common/navbar/navLinks.js

"use client";

import Link from "next/link";
import clsx from "clsx";

const NAV_LINKS = [
  { label: "Movies", href: "/movies" },
  { label: "Music", href: "/music" },
  { label: "Trending", href: "/trending" },
  { label: "Top Rated", href: "/top-rated" },
];

export default function NavLinks({ currentPath }) {
  return (
    <ul className="flex items-center gap-6">
      {NAV_LINKS.map(({ label, href }) => (
        <li key={href}>
          <Link
            href={href}
            className={clsx(
              "font-lexend text-sm font-medium transition-colors duration-150",
              "hover:text-kritiq-white relative group",
              currentPath === href ? "text-kritiq-white" : "text-kritiq-silver",
            )}
          >
            {label}
            <span
              className={clsx(
                "absolute -bottom-1 left-0 h-px bg-kritiq-red transition-all duration-200",
                currentPath === href ? "w-full" : "w-0 group-hover:w-full",
              )}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
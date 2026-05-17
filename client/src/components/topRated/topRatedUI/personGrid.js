// client/src/components/topRated/topRatedUI/personGrid.js
"use client";

import PersonCard from "./personCard";
//import { getPosterUrl } from "../../../services/cloudinary/upload/urlBuilders";

/**
 * PersonGrid
 * Responsive 2-col grid of PersonCards.
 * Mobile-first: 2 columns always on mobile, 3 on tablet+.
 *
 * @param {{ persons: import("@/types/spotlight").Person[] }} props
 */
export default function PersonGrid({ persons = [] }) {
  if (!persons.length) {
    return (
      <p
        style={{
          fontFamily: "var(--font-lexend, sans-serif)",
          fontSize: 14,
          color: "var(--color-kritiq-ash, #666)",
          textAlign: "center",
          padding: "40px 16px",
          margin: 0,
        }}
      >
        No persons found.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 16,
        padding: "0 16px",
      }}
    >
      {persons.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  );
}

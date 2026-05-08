// client/src/components/musicUI/musicGrid.js
"use client";

import MusicCard from "./musicCard";

export default function MusicGrid({ tracks = [] }) {
  if (!tracks.length) return null;

  return (
    <div className="mg-root">
      {tracks.map((track) => (
        <MusicCard key={track.id} track={track} />
      ))}
      <style jsx>{`
        .mg-root {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 640px) {
          .mg-root {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .mg-root {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

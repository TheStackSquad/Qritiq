// src/components/movies/movieDetails/movieMeta.js
"use client";

function MetaRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="mm-row">
      <span className="mm-label">{label}</span>
      <span className="mm-value">{value}</span>

      <style jsx>{`
        .mm-row {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .mm-label {
          font-family: var(--font-lexend);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
        }
        .mm-value {
          font-family: var(--font-lexend);
          font-size: 14px;
          color: var(--color-kritiq-silver);
        }
      `}</style>
    </div>
  );
}

export default function MovieMeta({ movie }) {
  if (
    !movie.description &&
    !movie.director &&
    !movie.production_company &&
    !movie.genre
  )
    return null;

  const cast = Array.isArray(movie.cast_list)
    ? movie.cast_list.join(", ")
    : null;

  return (
    <div className="mm-root">
      {movie.description && (
        <p className="mm-description">{movie.description}</p>
      )}

      <div className="mm-rows">
        <MetaRow label="Genre" value={movie.genre} />
        <MetaRow label="Director" value={movie.director} />
        <MetaRow label="Studio" value={movie.production_company} />
        <MetaRow label="Cast" value={cast} />
      </div>

      <style jsx>{`
        .mm-root {
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mm-description {
          font-family: var(--font-lexend);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-kritiq-silver);
          margin: 0;
        }

        .mm-rows {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}

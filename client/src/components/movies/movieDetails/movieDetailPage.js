// src/components/movies/movieDetails/movieDetailPage.js

"use client";

import { useMovie } from "../../../utils/hooks/useMovie";
import MovieHero from "./movieHero";
import MovieScores from "./movieScores";
import MovieMeta from "./movieMeta";
import MovieVoting from "./movieVoting";
import MovieTrailer from "./movieTrailer";
import MovieStreaming from "./movieStreaming";
import MovieDetailSkeleton from "./movieDetailSkeleton";
import Footer from "../../../components/home/footer/index";

export default function MovieDetailPage({ slug }) {
  const { data: movie, isLoading, error } = useMovie(slug);

  if (isLoading) return <MovieDetailSkeleton />;
  if (error || !movie) return <ErrorState />;

  return (
    <>
      <main className="mdp-root">
        <MovieHero movie={movie} />

        <div className="mdp-content-grid">
          {/* Main Column: Rich Content */}
          <article className="mdp-main-col">
            <section className="mdp-card-section">
              <MovieMeta movie={movie} />
            </section>

            <section className="mdp-card-section" id="trailer">
              <h3 className="section-title">Official Trailer</h3>
              <MovieTrailer movie={movie} />
            </section>
          </article>

          {/* Sidebar Column: Vital Stats & Interaction */}
          <aside className="mdp-side-col">
            <div className="sticky-sidebar">
              <MovieScores movie={movie} />

              <div className="mdp-card-section">
                <MovieVoting movie={movie} engagement={movie.user_engagement} />
              </div>

              <div className="mdp-card-section">
                <MovieStreaming title={movie.title} />
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .mdp-root {
          min-height: 100vh;
          background: var(--color-kritiq-black);
          padding-bottom: 60px;
        }

        .mdp-content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px;
        }

        .mdp-card-section {
          margin-bottom: 24px;
          background: var(--color-kritiq-dark-1);
          border: 1px solid var(--color-kritiq-dark-3);
          border-radius: var(--radius-card);
          overflow: hidden;
        }

        .section-title {
          padding: 16px 16px 0;
          font-family: var(--font-clash);
          color: var(--color-kritiq-white);
          font-size: 1rem;
          text-transform: uppercase;
        }

        /* Desktop Layout (768px +) */
        @media (min-width: 992px) {
          .mdp-content-grid {
            grid-template-columns: 1fr 380px;
            align-items: start;
          }

          .sticky-sidebar {
            position: sticky;
            top: 100px; /* Adjust based on your header height */
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .mdp-card-section {
            margin-bottom: 0; /* Let grid gap handle it */
          }
        }

        /* Low Bandwidth: Ensure fast painting */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}

function ErrorState() {
  return (
    <div className="mdp-error">
      <p>Movie not found</p>
      <span>It may have been removed or the link is incorrect</span>
      <style jsx>{`
        .mdp-error {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
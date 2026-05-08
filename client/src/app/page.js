// client/app/page.js
// Server component shell — layout and hero are static, MovieSection is client.
// This means the page HTML arrives instantly; the grid hydrates separately.

import Footer from "../components/home/footer/index";
import MovieSection from "../components/movies/movieUI/movieSection";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <main
        className="pt-16 min-h-screen"
        style={{ background: "var(--color-kritiq-black)" }}
      >
        <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <div className="hype-badge inline-flex mx-auto">
              🔥 Pre-Release Ratings Are Live
            </div>
            <h1
              className="font-clash font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight"
              style={{ color: "var(--color-kritiq-white)" }}
            >
              What Does the Street
              <br />
              <span className="text-gradient-red">Really Think?</span>
            </h1>
            <p
              className="text-base sm:text-lg max-w-xl mx-auto"
              style={{ color: "var(--color-kritiq-silver)" }}
            >
              Rate Nollywood films and Afrobeats releases before they drop. Your
              voice shapes the culture.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
              <Link href="/movies" className="btn-primary">
                Browse Movies
              </Link>
              <Link href="/upcoming" className="btn-ghost">
                See What&apos;s Coming
              </Link>
            </div>
          </div>
        </section>

        <MovieSection />
      </main>

      <Footer />
    </>
  );
}

// src/app/movies/[slug]/page.js
import { Suspense } from "react";
import MovieDetailPage from "../../../components/movies/movieDetails/movieDetailPage";
import MovieDetailSkeleton from "../../../components/movies/movieDetails/movieDetailSkeleton";

export default async function MovieSlugRoute({ params }) {
  const { slug } = await params;

  return (
    <Suspense fallback={<MovieDetailSkeleton />}>
      {/* ✅ Use the awaited slug */}
      <MovieDetailPage slug={slug} />
    </Suspense>
  );
}

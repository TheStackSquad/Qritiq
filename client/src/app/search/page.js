// client/src/app/search/page.js

"use client";

import { Suspense } from "react";
import SearchPage from "@/components/common/search/searchPage";

export default function SearchRoute() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
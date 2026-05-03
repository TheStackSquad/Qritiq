//client/components/common/navbar/desktopNav.js

"use client";

import NavLinks from "./navLinks";
import SearchBar from "./searchBar";
import UserProfile from "./userProfile";

export default function DesktopNav({ currentPath }) {
  return (
    <nav className="hidden md:flex items-center gap-8 h-full">
      <NavLinks currentPath={currentPath} />

      <div className="flex items-center gap-1 ml-4">
        <SearchBar />
        <UserProfile />
      </div>
    </nav>
  );
}
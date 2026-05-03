// client/src/sessions/uiStore.js

import { create } from "zustand";

const useUIStore = create((set) => ({
  // ─── State ───────────────────────────────────────────────
  menuOpen: false,
  searchOpen: false,

  // ─── Actions ─────────────────────────────────────────────
  openMenu: () => set({ menuOpen: true, searchOpen: false }),
  closeMenu: () => set({ menuOpen: false }),
  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen, searchOpen: false })),

  openSearch: () => set({ searchOpen: true, menuOpen: false }),
  closeSearch: () => set({ searchOpen: false }),

  closeAll: () => set({ menuOpen: false, searchOpen: false }),
}));

export default useUIStore;

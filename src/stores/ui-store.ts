"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── UI Store ──────────────────────────────────────────────
// Global UI state: sidebar, modals, preferences

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Upgrade modal
  upgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      upgradeModalOpen: false,
      setUpgradeModalOpen: (open) => set({ upgradeModalOpen: open }),
    }),
    {
      name: "creatoros-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

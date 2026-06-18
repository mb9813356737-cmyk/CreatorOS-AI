import { create } from "zustand";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  niche?: string;
  platform?: string;
  imageUrl?: string;
  plan?: string;
  emailVerified?: boolean;
  createdAt: string;
}

interface AuthState {
  user: UserProfile | null;
  role: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isRestored: boolean;

  setLoading: (loading: boolean) => void;
  restoreSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserFields: (fields: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  isRestored: false,

  setLoading: (loading) => set({ loading }),

  restoreSession: async () => {
    if (typeof window === "undefined") return;
    if (get().isRestored) return;
    try {
      set({ loading: true });
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          set({
            user: data.user,
            role: data.user.role,
            isAuthenticated: true,
            isRestored: true,
          });
          return;
        }
      }
      set({ isRestored: true, isAuthenticated: false, user: null, role: null });
    } catch (e) {
      console.error("Failed to restore session:", e);
      set({ isRestored: true });
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in.");
      }

      // Sync session details
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.user) {
          set({
            user: sessionData.user,
            role: sessionData.user.role,
            isAuthenticated: true,
          });
        }
      }
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, name, password) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If the server included a `debug` field (only in non-production),
        // log it to the browser console so the developer can see the real
        // Postgres/Prisma error in DevTools without it surfacing to the user.
        if (data.debug) {
          console.error("[signup debug] Server error detail:", data.debug);
        }
        throw new Error(data.error || "Failed to sign up.");
      }

      // Sync session details
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.user) {
          set({
            user: sessionData.user,
            role: sessionData.user.role,
            isAuthenticated: true,
          });
        }
      }
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      document.cookie = "creatoros_session=; path=/; max-age=0";
      set({
        user: null,
        role: null,
        isAuthenticated: false,
      });
    } catch (err) {
      console.error("Signout error:", err);
    } finally {
      set({ loading: false });
    }
  },

  updateUserFields: (fields) => {
    const { user } = get();
    if (!user) return;
    set({
      user: {
        ...user,
        ...fields,
      },
    });
  },
}));

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function SessionLoader({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const checkSession = async () => {
      try {
        useAuthStore.setState({ loading: true });
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            useAuthStore.setState({
              isAuthenticated: true,
              user: data.user,
              role: data.user.role,
              loading: false,
              isRestored: true,
            });
            
            // Set client cookie variables for dev debugging
            const planValue = data.user.plan || "FREE";
            document.cookie = `creatoros_sim_plan=${planValue}; path=/; max-age=86400`;
            
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      } finally {
        useAuthStore.setState({ loading: false, isRestored: true });
      }
    };

    checkSession();
  }, []);

  return <>{children}</>;
}

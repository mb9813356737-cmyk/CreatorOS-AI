"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

// Custom Clerk-replacement hooks mapping to Zustand AuthStore

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  // We keep ClerkProvider interface so layout.tsx compiles without modifications
  return <>{children}</>;
}

export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestored = useAuthStore((state) => state.isRestored);
  const user = useAuthStore((state) => state.user);

  return {
    isSignedIn: isAuthenticated,
    userId: user?.id || null,
    isLoaded: isRestored,
  };
}

export function useUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestored = useAuthStore((state) => state.isRestored);
  const user = useAuthStore((state) => state.user);

  const mappedUser = user
    ? {
        id: user.id,
        firstName: user.name?.split(" ")[0] || "Creator",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        fullName: user.name || "Creator",
        imageUrl: user.imageUrl || null,
        emailAddresses: [{ emailAddress: user.email }],
        publicMetadata: {
          role: user.role,
          plan: user.plan || "FREE",
        },
      }
    : null;

  return {
    isLoaded: isRestored,
    isSignedIn: isAuthenticated,
    user: mappedUser,
  };
}

export function SignOutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      
      // Clear custom auth store
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        role: null,
      });

      // Force-remove cookies
      document.cookie = "creatoros_session=; path=/; max-age=0";
      
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (React.isValidElement(children)) {
    const element = children as React.ReactElement<any>;
    return React.cloneElement(element, {
      onClick: async (e: any) => {
        if (element.props && typeof element.props.onClick === "function") {
          await element.props.onClick(e);
        }
        await handleSignOut();
      },
    });
  }

  return (
    <span onClick={handleSignOut} className="cursor-pointer">
      {children}
    </span>
  );
}

// A premium dropdown user button replacement
export function UserButton({ appearance }: any) {
  const { user } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!dropdownOpen) return;
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, [dropdownOpen]);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      useAuthStore.setState({ user: null, isAuthenticated: false, role: null });
      document.cookie = "creatoros_session=; path=/; max-age=0";
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "CR";

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center justify-center h-9 w-9 rounded-full border border-brand-500/30 bg-surface-100 hover:border-brand-500 transition-colors shadow-glow-sm cursor-pointer overflow-hidden focus:outline-hidden"
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt={user.fullName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-brand-400">{initials}</span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-glass-border bg-surface-50/95 p-1.5 shadow-elevated backdrop-blur-xl z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150">
          <div className="px-3 py-2 border-b border-glass-border/20 mb-1">
            <p className="text-xs font-bold text-text-primary truncate">{user.fullName}</p>
            <p className="text-[10px] text-text-secondary truncate mt-0.5">{user.emailAddresses[0]?.emailAddress}</p>
          </div>

          <Link
            href="/settings"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-100 rounded-lg transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Profile Settings</span>
          </Link>

          <Link
            href="/dashboard"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-100 rounded-lg transition-colors"
          >
            <User className="h-3.5 w-3.5" />
            <span>Workspace</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer text-left border-t border-glass-border/10 mt-1 pt-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function SignIn() {
  return null; // Custom pages used instead
}

export function SignUp() {
  return null; // Custom pages used instead
}

export function useSignIn() {
  return {};
}

export function useSignUp() {
  return {};
}

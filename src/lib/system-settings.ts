// ─── Persistent System Settings Helper ───────────────────────
// Uses environment variables in production (Vercel).
// Falls back to in-memory defaults so AI routes never crash.

interface SystemSettings {
  maintenanceMode: boolean;
  activeModel: string; // "gemini-flash" | "gpt-4o" | "llama3-groq"
}

const DEFAULT_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  activeModel:
    process.env.AI_PROVIDER === "openai"
      ? "gpt-4o"
      : process.env.AI_PROVIDER === "groq"
      ? "llama3-groq"
      : "gemini-flash",
};

// In-memory override (only applies within the same serverless invocation lifecycle)
let _runtimeOverride: Partial<SystemSettings> = {};

export function getSystemSettings(): SystemSettings {
  try {
    // Production: use env vars + in-memory override only (no filesystem on Vercel)
    const maintenanceFromEnv = process.env.MAINTENANCE_MODE === "true";
    return {
      ...DEFAULT_SETTINGS,
      maintenanceMode: maintenanceFromEnv,
      ..._runtimeOverride,
    };
  } catch (err) {
    console.error("Failed to read system settings:", err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
  try {
    // Apply to in-memory override for the current process lifetime
    _runtimeOverride = { ..._runtimeOverride, ...settings };
    return getSystemSettings();
  } catch (err) {
    console.error("Failed to save system settings:", err);
    return getSystemSettings();
  }
}

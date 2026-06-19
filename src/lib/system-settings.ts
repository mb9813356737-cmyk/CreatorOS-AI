// ─── Persistent System Settings Helper ───────────────────────
// Uses Redis storage to survive serverless function restarts.
// Falls back to local in-memory cache and env vars if Redis is offline.

import { getRedisClient } from "./redis";

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

// In-memory fallback cache
let _localCache: SystemSettings = { ...DEFAULT_SETTINGS };

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const client = getRedisClient();
    if (!client) {
      const maintenanceFromEnv = process.env.MAINTENANCE_MODE === "true";
      return {
        ..._localCache,
        maintenanceMode: _localCache.maintenanceMode || maintenanceFromEnv,
      };
    }

    const data = await client.get("system:settings");
    if (data) {
      _localCache = {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(data),
      };
      return _localCache;
    }
  } catch (err) {
    console.error("Failed to read system settings from Redis:", err);
  }

  const maintenanceFromEnv = process.env.MAINTENANCE_MODE === "true";
  return {
    ..._localCache,
    maintenanceMode: _localCache.maintenanceMode || maintenanceFromEnv,
  };
}

export async function saveSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  try {
    const current = await getSystemSettings();
    const updated = { ...current, ...settings };
    
    _localCache = updated;

    const client = getRedisClient();
    if (client) {
      await client.set("system:settings", JSON.stringify(updated));
    }
    return updated;
  } catch (err) {
    console.error("Failed to save system settings to Redis:", err);
    return _localCache;
  }
}


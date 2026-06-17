class Logger {
  private isDev = process.env.NODE_ENV === "development";

  info(...args: any[]) {
    if (this.isDev) {
      console.log("ℹ️ [INFO]:", ...args);
    }
  }

  warn(...args: any[]) {
    console.warn("⚠️ [WARN]:", ...args);
  }

  error(...args: any[]) {
    console.error("🔴 [ERROR]:", ...args);
  }

  debug(...args: any[]) {
    if (this.isDev) {
      console.debug("🔍 [DEBUG]:", ...args);
    }
  }
}

export const logger = new Logger();

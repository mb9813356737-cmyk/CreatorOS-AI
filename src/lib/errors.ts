import { NextResponse } from "next/server";
import { logger } from "./logger";

export function handleRouteError(error: any, contextMessage: string = "API Route execution failed") {
  // Log real error server-side securely
  logger.error(`${contextMessage}:`, error);

  // Return a generic sanitized message to prevent schema/SQL structure leakage
  return NextResponse.json(
    { error: "Something went wrong. Please try again later." },
    { status: 500 }
  );
}

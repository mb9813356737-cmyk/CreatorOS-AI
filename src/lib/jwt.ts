import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[Security] FATAL: JWT_SECRET environment variable is missing in production!"
      );
    }
    console.warn(
      "[Security] WARNING: JWT_SECRET is not set. Using insecure fallback secret for development."
    );
    return new TextEncoder().encode("fallback_secret_must_be_configured_in_production_32_chars");
  }
  
  if (secret.length < 32) {
    console.warn(
      "[Security] WARNING: JWT_SECRET should be at least 32 characters long. Current length: " + secret.length
    );
  }
  return new TextEncoder().encode(secret);
};

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  emailVerified: boolean;
  passwordVersion: string;
  plan: string;
}

export async function signJWT(payload: JWTPayload) {
  const secret = getSecret();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyJWT(token: string) {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

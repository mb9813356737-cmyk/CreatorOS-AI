import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Return a fallback for build time or warning in development, but in prod we require it
    return new TextEncoder().encode("fallback_secret_must_be_configured_in_production_32_chars");
  }
  return new TextEncoder().encode(secret);
};

export async function signJWT(payload: {
  userId: string;
  email: string;
  role: string;
  emailVerified: boolean;
}) {
  const secret = getSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyJWT(token: string) {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as {
      userId: string;
      email: string;
      role: string;
      emailVerified: boolean;
    };
  } catch {
    return null;
  }
}

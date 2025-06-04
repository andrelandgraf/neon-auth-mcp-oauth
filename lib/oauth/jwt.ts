import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { config } from "@/lib/config";

const encoder = new TextEncoder();
const secret = encoder.encode(config.oauth.secret);

export type JwtPayload = {
  sub: string; // user id
  scope: string;
  aud: "mcp";
};

/**
 * Create a signed JWT
 */
export async function signJwt(payload: JwtPayload, expiresInSec = 60 * 60) {
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSec)
    .sign(secret);
}

/**
 * Verify a JWT and return the payload
 */
export async function verifyJwt(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify<JwtPayload>(token, secret);
  return payload;
}

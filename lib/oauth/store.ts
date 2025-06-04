import { kv } from "@/lib/kv/store";
import { nanoid } from "nanoid";

// === Auth Code ===
type AuthorizationCodeData = {
  client_id: string;
  user_id: string;
  redirect_uri: string;
  scope: string;
};

export function generateAuthorizationCode() {
  return nanoid(32);
}

export async function storeAuthorizationCode(
  code: string,
  data: AuthorizationCodeData,
): Promise<void> {
  await kv.set(`auth_code:${code}`, data, {
    ex: 5 * 60, // 5 minutes
  });
}

export async function getAuthorizationCode(
  code: string,
): Promise<AuthorizationCodeData | null> {
  return kv.get<AuthorizationCodeData>(`auth_code:${code}`);
}

export async function deleteAuthorizationCode(code: string): Promise<void> {
  await kv.del(`auth_code:${code}`);
}

// === Refresh Token ===
type RefreshTokenData = {
  client_id: string;
  user_id: string;
  scope: string;
};

export function generateRefreshToken() {
  return nanoid(64);
}

export async function storeRefreshToken(
  refreshToken: string,
  data: RefreshTokenData,
): Promise<void> {
  await kv.set(`refresh_token:${refreshToken}`, data, {
    ex: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getRefreshToken(
  refreshToken: string,
): Promise<RefreshTokenData | null> {
  return kv.get<RefreshTokenData>(`refresh_token:${refreshToken}`);
}

export async function deleteRefreshToken(refreshToken: string): Promise<void> {
  await kv.del(`refresh_token:${refreshToken}`);
}

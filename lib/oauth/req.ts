import { verifyJwt } from "./jwt";
import { failed, Result, succeeded } from "@/lib/result-type";

export type OAuthErrorCode =
  | "invalid_token"
  | "invalid_request"
  | "insufficient_scope";

export class AuthorizationError extends Error {
  errorCode: OAuthErrorCode;
  constructor(errorCode: OAuthErrorCode, message: string) {
    super(message);
    this.errorCode = errorCode;
    this.name = "AuthorizationError";
  }
}

export async function getUserIdFromRequest(
  req: Request,
): Promise<Result<string, AuthorizationError>> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return failed(
      new AuthorizationError(
        "invalid_token",
        "Missing or invalid Authorization header",
      ),
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();
  try {
    const payload = await verifyJwt(token);
    if (!payload.sub) {
      return failed(
        new AuthorizationError(
          "invalid_token",
          "Token missing subject (user ID)",
        ),
      );
    }
    if (payload.aud !== "mcp") {
      return failed(
        new AuthorizationError("invalid_token", "Invalid audience"),
      );
    }
    return succeeded(payload.sub);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Token verification failed";
    return failed(new AuthorizationError("invalid_token", message));
  }
}

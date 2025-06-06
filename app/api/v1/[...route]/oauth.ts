import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import {
  deleteAuthorizationCode,
  deleteRefreshToken,
  generateAuthorizationCode,
  generateRefreshToken,
  getAuthorizationCode,
  getRefreshToken,
  storeAuthorizationCode,
  storeRefreshToken,
} from "@/lib/oauth/store";
import {} from "@stackframe/stack";
import { config } from "@/lib/config";
import { signJwt } from "@/lib/oauth/jwt";
import { allOAuthScopes } from "@/lib/oauth/scopes";
import { registerOAuthClient } from "@/lib/oauth/register";
import { getLoginUrl, stackServerApp } from "@/lib/stack";

const oauthApp = new Hono();
oauthApp.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

oauthApp.post("/register", async (c) => {
  const registration = await registerOAuthClient();
  return c.json(registration, 201);
});

// Schema for the /authorize query
const authorizeParams = z.object({
  response_type: z.literal("code"),
  client_id: z.string(),
  redirect_uri: z.string().url(),
  scope: z.string().optional(),
  state: z.string().optional(),
});

oauthApp.get("/authorize", async (c) => {
  const result = authorizeParams.safeParse(c.req.query());
  if (!result.success) {
    return c.text("Invalid request parameters", 400);
  }

  // For now, ignore incomnig scope, always use all scopes
  const { client_id, redirect_uri, state } = result.data;
  const user = await stackServerApp.getUser();
  if (!user) {
    const authorizeUrl = new URL(`${config.origin}/api/v1/oauth/authorize`);
    authorizeUrl.searchParams.set("client_id", client_id);
    authorizeUrl.searchParams.set("redirect_uri", redirect_uri);
    authorizeUrl.searchParams.set("response_type", "code");
    if (state) authorizeUrl.searchParams.set("state", state);
    return c.redirect(getLoginUrl(authorizeUrl.toString()));
  }

  const code = generateAuthorizationCode();
  await storeAuthorizationCode(code, {
    client_id,
    user_id: user.id,
    redirect_uri,
    scope: allOAuthScopes,
  });

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state);

  return c.redirect(redirectUrl.toString());
});

const tokenParams = z.discriminatedUnion("grant_type", [
  z.object({
    grant_type: z.literal("authorization_code"),
    code: z.string(),
    redirect_uri: z.string().url(),
    client_id: z.string(),
  }),
  z.object({
    grant_type: z.literal("refresh_token"),
    refresh_token: z.string(),
    client_id: z.string(),
  }),
]);

oauthApp.post("/token", async (c) => {
  const body = await c.req.parseBody();
  const result = tokenParams.safeParse(body);

  console.debug("OAuth token request received", { body });

  if (!result.success) {
    console.debug("OAuth token request failed validation", {
      reason: "Invalid request parameters",
      errors: result.error.errors,
    });
    return c.json(
      {
        error: "invalid_request",
        error_description: "Missing or invalid parameters",
      },
      400,
    );
  }

  const data = result.data;

  if (data.grant_type === "authorization_code") {
    const { code, client_id, redirect_uri } = data;

    const codeData = await getAuthorizationCode(code);
    if (!codeData) {
      return c.json(
        {
          error: "invalid_grant",
          error_description: "Invalid or expired authorization code",
        },
        400,
      );
    }

    if (
      codeData.client_id !== client_id ||
      codeData.redirect_uri !== redirect_uri
    ) {
      return c.json(
        {
          error: "invalid_grant",
          error_description: "Mismatched client_id or redirect_uri",
        },
        400,
      );
    }

    await deleteAuthorizationCode(code);

    const accessToken = await signJwt({
      sub: codeData.user_id,
      aud: "mcp",
      scope: codeData.scope,
    });

    const refreshToken = generateRefreshToken();
    await storeRefreshToken(refreshToken, {
      client_id: client_id,
      user_id: codeData.user_id,
      scope: codeData.scope,
    });

    return c.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_in: 3600,
    });
  }

  if (data.grant_type === "refresh_token") {
    const { refresh_token, client_id } = data;

    const stored = await getRefreshToken(refresh_token);
    if (!stored) {
      return c.json(
        {
          error: "invalid_grant",
          error_description: "Invalid or expired refresh token",
        },
        400,
      );
    }

    if (stored.client_id !== client_id) {
      return c.json(
        {
          error: "invalid_grant",
          error_description: "Client mismatch",
        },
        400,
      );
    }

    // Invalidate old refresh token
    await deleteRefreshToken(refresh_token);

    const accessToken = await signJwt({
      sub: stored.user_id,
      aud: "mcp",
      scope: stored.scope,
    });

    const newRefreshToken = generateRefreshToken();
    await storeRefreshToken(newRefreshToken, stored);

    return c.json({
      access_token: accessToken,
      refresh_token: newRefreshToken,
      token_type: "Bearer",
      expires_in: 3600,
    });
  }

  // Fallback shouldn't be hit due to Zod discriminated union
  return c.json(
    {
      error: "unsupported_grant_type",
    },
    400,
  );
});

export { oauthApp };

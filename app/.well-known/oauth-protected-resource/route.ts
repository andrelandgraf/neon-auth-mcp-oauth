import { NextRequest, NextResponse } from "next/server";
import { config } from "../../../lib/config";
import { OAUTH_SCOPES } from "../../../lib/oauth/scopes";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function GET(_req: NextRequest) {
  const metadata = {
    resource: `${config.origin}/api/v1/mcp`,
    issuer: config.origin,
    scopes_supported: Object.keys(OAUTH_SCOPES),
    authorization_servers: [config.origin],
  };

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json",
  };

  return NextResponse.json(metadata, { headers });
}

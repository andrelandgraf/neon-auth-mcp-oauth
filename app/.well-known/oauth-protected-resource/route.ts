import { NextRequest, NextResponse } from "next/server";
import { config } from "../../../lib/config";
import { OAUTH_SCOPES } from "../../../lib/oauth/scopes";

export async function GET(_req: NextRequest) {
  const metadata = {
    resource: `${config.origin}/api/v1/mcp`,
    issuer: config.origin,
    scopes_supported: Object.keys(OAUTH_SCOPES),
    authorization_servers: [config.origin],
  };

  return NextResponse.json(metadata);
}

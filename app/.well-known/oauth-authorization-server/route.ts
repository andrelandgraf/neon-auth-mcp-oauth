import { NextRequest, NextResponse } from "next/server"
import { config } from "../../../lib/config"

export async function GET(_request: NextRequest) {
	const metadata = {
		issuer: config.origin,
		authorization_endpoint: `${config.origin}/api/v1/oauth/authorize`,
		token_endpoint: `${config.origin}/api/v1/oauth/token`,
		registration_endpoint: `${config.origin}/api/v1/oauth/register`,
		code_challenge_methods_supported: ["S256"],
		response_types_supported: ["code"],
		grant_types_supported: ["authorization_code", "refresh_token"],
		token_endpoint_auth_methods_supported: ["none"],
	}

	return NextResponse.json(metadata)
}

# Neon Auth MCP OAuth

PoC implementation of a custom MCP OAuth flow with Next.js, Neon, Upstash Redis, and Neon Auth.

You can try it out by adding the following MCP config to Cursor, Windsurf, Claude Desktop, etc.:

```json
{
  "mcpServers": {
      "echo": {
          "command": "npx",
          "args": [
              "-y",
              "mcp-remote",
              "https://neon-auth-mcp-oauth-6zf3o859s-andrelandgraf.vercel.app"
          ]
      }
  }
}
```

Replace the example URL with `http://localhost:3000` to try our the development server.

## Setup

1. Set up Neon and Neon Auth.
2. Deploy to Vercel and set up Redis Upstash via the Vercel Upstash Integration.

## Environment

Create a `.env` file.  Review [./lib/config.ts](./lib/config.ts) for a full list of required .env variables.
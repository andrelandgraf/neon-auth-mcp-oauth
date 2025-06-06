![MCP Inspector Demo](./assets/inspector-demo.gif)

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
        "https://neon-auth-mcp-oauth.vercel.app/api/v1/mcp"
      ]
    }
  }
}
```

Replace the example URL with `http://localhost:3000/api/v1/mcp` to try our the development server.

Note: Run `rm -rf ~/.mcp-auth` if you are running into issues. MCP auth is still flaky in my experience and resetting the stored auth state of the `mcp-remote` package helps.

## Setup

1. Set up Neon and Neon Auth.
2. Deploy to Vercel and set up Redis Upstash via the Vercel Upstash Integration.

## Environment

Create a `.env` file. Review [./lib/config.ts](./lib/config.ts) for a full list of required .env variables.

## Development

- Run the MCP Inspector for debugging:

```bash
npm run playground
```

- Paste `http://localhost:3000/api/v1/mcp` in the MCP Inspector MCP Server URL field.

- Run the application

```bash
npm run dev
```

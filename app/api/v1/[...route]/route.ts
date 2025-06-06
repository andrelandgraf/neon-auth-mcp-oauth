import { Hono } from "hono";
import { handle } from "hono/vercel";
import { mcpApp } from "./mcp";
import { oauthApp } from "./oauth";

export const dynamic = "force-dynamic";

const app = new Hono().basePath("/api/v1");

app.route("/oauth", oauthApp);
app.route("/mcp", mcpApp);

export const OPTIONS = handle(app);
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

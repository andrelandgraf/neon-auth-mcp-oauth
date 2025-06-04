import { Hono } from "hono";
import { handle } from "hono/vercel";
import { electricApp } from "./shape";
import { mcpApp } from "./mcp";
import { oauthApp } from "./oauth";
import { statusChecksApp } from "./status-checks";

export const dynamic = "force-dynamic";

const app = new Hono().basePath("/api/v1");

app.route("/oauth", oauthApp);
app.route("/shape", electricApp);
app.route("/mcp", mcpApp);
app.route("/status-checks", statusChecksApp);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

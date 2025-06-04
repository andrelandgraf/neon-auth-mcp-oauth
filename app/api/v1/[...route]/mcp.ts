import { Context, Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toFetchResponse, toReqRes } from "fetch-to-node";
import { config } from "@/lib/config";
import { withAuthorizedBackgroundTaskContext } from "@/lib/context";
import { getUserIdFromRequest, OAuthErrorCode } from "@/lib/oauth/req";

type UnauthorizedOptions = {
  error: OAuthErrorCode;
  message: string;
};

export function unauthorized(c: Context, options: UnauthorizedOptions) {
  const { error, message } = options;

  const realm = "mcp";
  const authorizationUri = `${config.origin}/api/v1/oauth/authorize`;
  const resource = `${config.origin}/api/v1/mcp`;
  const headerValue = [
    `Bearer realm="${realm}"`,
    `authorization_uri="${authorizationUri}"`,
    `resource="${resource}"`,
    `error="${error}"`,
    `error_description="${message}"`,
  ].join(", ");

  return c.json(
    {
      error,
      message,
    },
    401,
    {
      "Content-Type": "application/json",
      "WWW-Authenticate": headerValue,
    },
  );
}

function getServer() {
  // Create an MCP server with implementation details
  const server = new McpServer(
    {
      name: "example app - echo server",
      version: "1.0.0",
    },
    { capabilities: { logging: {} } },
  );

  // Example tool: echo
  server.tool(
    "echo",
    { message: { description: "The message to echo back.", type: "string" } },
    async (args) => {
      return { content: args.message };
    },
  );

  // Added for extra debuggability
  server.server.onerror = console.error.bind(console);

  return server;
}

const mcpApp = new Hono();

mcpApp.post("/", async (c) => {
  const { req, res } = toReqRes(c.req.raw);
  const userIdRes = await getUserIdFromRequest(c.req.raw);
  if (!userIdRes.success) {
    return unauthorized(c, {
      error: userIdRes.error.errorCode,
      message: userIdRes.error.message,
    });
  }
  return withAuthorizedBackgroundTaskContext(userIdRes.value, async () => {
    const server = await getServer();
    try {
      const transport: StreamableHTTPServerTransport =
        new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });

      // Added for extra debuggability
      transport.onerror = console.error.bind(console);

      await server.connect(transport);

      await transport.handleRequest(req, res, await c.req.json());

      res.on("close", () => {
        console.log("Request closed");
        transport.close();
        server.close();
      });

      return toFetchResponse(res);
    } catch (e) {
      console.error(e);
      return c.json(
        {
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message:
              "Internal server error. If this problem persists, please check your MCP configuration.",
          },
          id: null,
        },
        { status: 500 },
      );
    }
  });
});

mcpApp.get("/", async (c) => {
  console.log("Received GET MCP request");
  return c.json(
    {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed. This is an MCP server endpoint.",
      },
      id: null,
    },
    { status: 405 },
  );
});

mcpApp.delete("/", async (c) => {
  console.log("Received DELETE MCP request");
  return c.json(
    {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message:
          "Method not allowed. This is an MCP server endpoint that only accepts POST requests.",
      },
      id: null,
    },
    { status: 405 },
  );
});

export { mcpApp };

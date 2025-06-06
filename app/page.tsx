"use client";
import Image from "next/image";
import { useUser, useStackApp } from "@stackframe/stack";

function AuthIndicator() {
  const user = useUser();
  const app = useStackApp();
  if (user) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 rounded bg-green-100 text-green-800 font-semibold text-base shadow-sm border border-green-200">
        <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
        <span>
          Logged in as {user.displayName || user.primaryEmail || user.id}
        </span>
        <button
          className="ml-2 px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700 border border-red-700 transition-colors"
          onClick={() => user.signOut()}
        >
          Log out
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded bg-red-100 text-red-800 font-semibold text-base shadow-sm border border-red-200">
      <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
      Not logged in
      <button
        className="ml-3 px-3 py-1 rounded bg-black text-white text-sm hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-black/10 dark:border-white/20"
        onClick={() =>
          app.redirectToSignIn?.() || (window.location.href = "/handler/login")
        }
      >
        Sign up / Log in
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-6">
      <div className="w-full flex justify-end mb-8">
        <AuthIndicator />
      </div>
      <main className="flex flex-col items-center gap-8 w-full max-w-2xl">
        <Image
          className="dark:invert mb-2"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-3xl font-bold text-center mb-2">
          Neon Auth MCP OAuth
        </h1>
        <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-4">
          PoC implementation of a custom MCP OAuth flow with Next.js, Neon,
          Upstash Redis, and Neon Auth.
        </p>
        <section className="w-full bg-white dark:bg-neutral-900 rounded-lg shadow p-6 border border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold mb-2">Try it out</h2>
          <p className="mb-2">
            Add the following MCP config to Cursor, Windsurf, Claude Desktop,
            etc.:
          </p>
          <pre className="bg-gray-100 dark:bg-neutral-800 rounded p-3 text-xs overflow-x-auto mb-2">
            {`{
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
}`}
          </pre>
          <p className="mb-2">
            Replace the example URL with{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
              http://localhost:3000/api/v1/mcp
            </code>{" "}
            to try out the development server.
          </p>
        </section>
        <section className="w-full bg-white dark:bg-neutral-900 rounded-lg shadow p-6 border border-gray-200 dark:border-neutral-800 mt-4">
          <h2 className="text-xl font-semibold mb-2">Setup</h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-2">
            <li>Set up Neon and Neon Auth.</li>
            <li>
              Deploy to Vercel and set up Redis Upstash via the Vercel Upstash
              Integration.
            </li>
          </ol>
          <p className="mb-0">
            <strong>Environment:</strong> Create a{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
              .env
            </code>{" "}
            file. Review{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
              lib/config.ts
            </code>{" "}
            for a full list of required .env variables.
          </p>
        </section>
      </main>
    </div>
  );
}

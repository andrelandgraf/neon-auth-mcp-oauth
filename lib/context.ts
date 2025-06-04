import { AsyncLocalStorage } from "node:async_hooks";
import { stackServerApp } from "@/lib/stack";
import { invariant } from "@epic-web/invariant";
import { remember } from "@epic-web/remember";
import { Database, getDatabaseClient } from "@/lib/db/db";
import {
  getServerApplicationConfig,
  ServerApplicationConfig,
} from "@/lib/config";

type AuthenticatedUserContext = {
  type: "authenticated";
  config: ServerApplicationConfig;
  db: Database;
  userId: string;
};

type AuthorizedBackgroundTaskContext = {
  type: "authorized";
  config: ServerApplicationConfig;
  db: Database;
  userId: string;
};

type ServerContext =
  | {
      type: "unauthenticated";
      config: ServerApplicationConfig;
      db: Database; // admin db
    }
  | AuthenticatedUserContext
  | AuthorizedBackgroundTaskContext;

const serverContext = remember(
  "server-context",
  () => new AsyncLocalStorage<ServerContext>(),
);

export function getServerContext() {
  const store = serverContext.getStore();
  invariant(!!store, "No server context found");
  return store;
}

export function getUserServerContext() {
  const context = getServerContext();
  if (context.type === "authenticated" || context.type === "authorized") {
    return context;
  }
  throw new Error("No user context found in server context");
}

type Callback<T> = () => Promise<T> | T;

export async function withAuthenticatedUserContext<T>(
  cb: Callback<T>,
): Promise<T> {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const config = getServerApplicationConfig();
  const db = getDatabaseClient({ config });
  return serverContext.run(
    { type: "authenticated", config, db, userId: user.id },
    cb,
  );
}

function isAuthenticatedUserContext(
  context: ServerContext | undefined,
): context is AuthenticatedUserContext {
  return !!context && context.type === "authenticated";
}

export function getAuthenticatedUserContext() {
  const store = serverContext.getStore();
  invariant(
    isAuthenticatedUserContext(store),
    "No authenticated user context found",
  );
  return store;
}

// Async Local Storage for authorized background tasks tied to a user

export async function withAuthorizedBackgroundTaskContext<T>(
  userId: string,
  cb: Callback<T>,
): Promise<T> {
  const config = getServerApplicationConfig();
  const db = getDatabaseClient({ config });
  return serverContext.run({ type: "authorized", config, db, userId }, cb);
}

function isAuthorizedBackgroundTaskContext(
  context: ServerContext | undefined,
): context is AuthorizedBackgroundTaskContext {
  return !!context && context.type === "authorized";
}

export function getAuthorizedBackgroundTaskContext() {
  const store = serverContext.getStore();
  invariant(
    isAuthorizedBackgroundTaskContext(store),
    "No authorized background task context found",
  );
  return store;
}

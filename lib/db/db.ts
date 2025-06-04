import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { remember } from "@epic-web/remember";
import { config, type ServerApplicationConfig } from "@/lib/config";
import * as schema from "./schema";

type DatabaseContext = {
  config: ServerApplicationConfig;
};

export type Database = ReturnType<typeof getDatabaseClient>;

export function getDatabaseClient(ctx: DatabaseContext) {
  return remember("db", () =>
    drizzle(neon(ctx.config.neon.databaseUrl), { schema }),
  );
}

export const db = getDatabaseClient({ config });

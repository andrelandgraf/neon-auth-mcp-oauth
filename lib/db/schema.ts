import { timestamp } from "drizzle-orm/pg-core";
import { usersSync as usersSyncTable } from "drizzle-orm/neon";

export type User = typeof usersSyncTable.$inferSelect;
export type NewUser = typeof usersSyncTable.$inferInsert;

export const usersTable = usersSyncTable;

import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Generic key-value store for app-level configuration.
 * Keys: "position" ("SAME" | "DISTANCE"), "paired_pos_id", "local_ip", etc.
 */
export const appState = sqliteTable("app_state", {
  key:   text("key").primaryKey(),
  value: text("value").notNull(),
});

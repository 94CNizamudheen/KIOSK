import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/Schema/**/*.ts",
  out: "./src-tauri/src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./local.db",
  },
});

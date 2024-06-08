import type { Config } from "drizzle-kit";
import { env } from "../../config/env";

export default {
  dialect: "mysql",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["projects*"],
} satisfies Config;

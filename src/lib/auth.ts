import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/db";
import { env } from "./env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
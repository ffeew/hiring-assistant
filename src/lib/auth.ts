import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db/db";


export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      gmailAddress: {
        type: "string",
        required: false,
      },
      gmailAppPassword: {
        type: "string",
        required: false,
      },
      companyName: {
        type: "string",
        required: false,
      },
      jobTitle: {
        type: "string",
        required: false,
      },
    }
  },
  plugins: [nextCookies()], // This must be last in the plugins array
});

export type Session = typeof auth.$Infer.Session;
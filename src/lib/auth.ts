import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "./db/db";
import { safeEncrypt } from "./crypto";


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
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Encrypt Gmail app password before signup (only if provided)
      if (ctx.path === "/sign-up/email" && ctx.body?.gmailAppPassword && ctx.body.gmailAppPassword.trim() !== "") {
        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              gmailAppPassword: safeEncrypt(ctx.body.gmailAppPassword),
            },
          }
        };
      }
      
      // Clear empty Gmail fields to avoid storing empty strings
      if (ctx.path === "/sign-up/email") {
        const updatedBody = { ...ctx.body };
        if (!updatedBody.gmailAddress || updatedBody.gmailAddress.trim() === "") {
          updatedBody.gmailAddress = undefined;
        }
        if (!updatedBody.gmailAppPassword || updatedBody.gmailAppPassword.trim() === "") {
          updatedBody.gmailAppPassword = undefined;
        }
        
        return {
          context: {
            ...ctx,
            body: updatedBody,
          }
        };
      }
    }),
  },
  plugins: [nextCookies()], // This must be last in the plugins array
});

export type Session = typeof auth.$Infer.Session;
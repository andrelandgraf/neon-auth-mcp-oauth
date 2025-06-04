import { remember } from "@epic-web/remember";
import { z } from "zod";

const ConfigSchema = z.object({
  env: z.enum(["development", "production"]),
  origin: z.string().url(),
  oauth: z.object({
    secret: z.string().min(1, "OAUTH_JWT_SECRET is required"),
  }),
  stackAuth: z.object({
    secretServerKey: z.string().min(1, "STACK_SECRET_SERVER_KEY is required"),
    publishableClientKey: z
      .string()
      .min(1, "NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY is required"),
    publishableProjectId: z
      .string()
      .min(1, "NEXT_PUBLIC_STACK_PROJECT_ID is required"),
  }),
  kv: z.object({
    restUrl: z.string().min(1, "KV_REST_API_URL is required"),
    restToken: z.string().min(1, "KV_REST_API_TOKEN is required"),
  }),
  neon: z.object({
    databaseUrl: z.string().min(1, "DATABASE_URL is required"),
  }),
});

export type ServerApplicationConfig = z.infer<typeof ConfigSchema>;

export function getServerApplicationConfig(): ServerApplicationConfig {
  try {
    return ConfigSchema.parse({
      env: process.env.NODE_ENV,
      // NEXT_PUBLIC_ORIGIN is set in prod and locally, fallback to VERCEL_URL for preview environments
      origin:
        process.env.NEXT_PUBLIC_ORIGIN || `https://${process.env.VERCEL_URL}`,
      oauth: {
        secret: process.env.OAUTH_JWT_SECRET,
      },
      stackAuth: {
        secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
        publishableClientKey:
          process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
        publishableProjectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      },
      kv: {
        restUrl: process.env.KV_REST_API_URL,
        restToken: process.env.KV_REST_API_TOKEN,
      },
      neon: {
        databaseUrl: process.env.DATABASE_URL,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.message).join("\n");
      throw new Error(
        `Missing or invalid environment variables:\n${missingVars}`,
      );
    }
    throw error;
  }
}

export const config = remember("config", getServerApplicationConfig);

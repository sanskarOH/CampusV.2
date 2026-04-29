import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  AUTH_COOKIE_NAME: z.string().default("cms_access_token"),
  APP_URL: z.string().url().optional(),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(120),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60_000),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  return parsed.data;
}

export const env = loadEnv();

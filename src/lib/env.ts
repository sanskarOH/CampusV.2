// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  AUTH_COOKIE_NAME: z.string().default("cms_access_token"),
  APP_URL: z.string().url().optional(),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(120),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60_000),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        `Invalid environment: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
      );
    }
    _env = parsed.data;
  }
  return _env;
}

// keep `env` as a convenience alias (lazy getter)
export const env = new Proxy({} as Env, {
  get(_, key) {
    return getEnv()[key as keyof Env];
  },
});

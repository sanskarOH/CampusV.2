import { logger } from "@/lib/logger";

/**
 * Mock email sender. Swap for SendGrid, SES, Resend, etc. in production.
 */
export async function sendEmailMock(to: string, subject: string, body: string) {
  logger.info({ to, subject, bodyPreview: body.slice(0, 120) }, "email(mock)");
  return { delivered: true };
}

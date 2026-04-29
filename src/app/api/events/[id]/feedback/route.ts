export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { eventIdParamSchema } from "@/validators/event.schema";
import { createFeedbackBodySchema } from "@/validators/feedback.schema";
import { createFeedback } from "@/services/feedback.service";
import { jsonSuccess } from "@/lib/api-response";
import { runApi } from "@/server/run-api";
import { requireSession } from "@/server/session";

type Ctx = { params: { id: string } };

export async function POST(req: NextRequest, context: Ctx) {
  return runApi(req, async () => {
    const session = await requireSession();
    const { id: eventId } = eventIdParamSchema.parse(context.params);
    const body = createFeedbackBodySchema.parse(await req.json());
    const feedback = await createFeedback({
      userId: session.id,
      eventId,
      rating: body.rating,
      comment: body.comment,
    });
    return jsonSuccess({ feedback }, 201);
  });
}

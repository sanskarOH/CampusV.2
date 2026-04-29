import { EventDetailView } from "./event-detail";

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <EventDetailView eventId={params.id} />;
}

import { EditEventForm } from "./edit-event-form";

export default function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  return <EditEventForm eventId={params.id} />;
}

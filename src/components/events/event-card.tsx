import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import type { EventListItem } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/format";

type Props = {
  event: EventListItem;
};

export function EventCard({ event }: Props) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-transform hover:-translate-y-0.5">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Badge variant="secondary" className="font-normal">
            {event.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatEventDate(event.date)}
          </span>
        </div>
        <Link
          href={`/events/${event.id}`}
          className="line-clamp-2 text-lg font-semibold tracking-tight hover:text-primary"
        >
          {event.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {event.description}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pb-2 pt-0 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0" />
          <span>
            {event.seatsAvailable} / {event.seats} seats left
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="line-clamp-1">Organized by {event.organizer.name}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="text-xs leading-relaxed">
            Venue details are shared in the event description. Check the event page
            for location and guidelines.
          </span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto border-t bg-muted/30 pt-4">
        <Button asChild className="w-full" variant="default">
          <Link href={`/events/${event.id}`}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

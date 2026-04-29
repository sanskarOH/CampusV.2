"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost } from "@/lib/api";
import { formatEventDate, eventHasEnded } from "@/lib/format";
import type { EventDetail, RegistrationRow } from "@/lib/types";
import { useSession } from "@/components/providers/session-provider";

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(2000),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

export function EventDetailView({ eventId }: { eventId: string }) {
  const { user, refresh } = useSession();
  const router = useRouter();
  const [event, setEvent] = React.useState<EventDetail | null>(null);
  const [regs, setRegs] = React.useState<RegistrationRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [registering, setRegistering] = React.useState(false);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    const [ev, dash] = await Promise.all([
      apiGet<{ event: EventDetail & { seatsTaken: number; seatsAvailable: number } }>(
        `/api/events/${eventId}`
      ),
      user
        ? apiGet<{ registrations: RegistrationRow[] }>(
            "/api/dashboard/registrations"
          )
        : Promise.resolve({ success: false as const, error: "" }),
    ]);
    if (ev.success) setEvent(ev.data.event as EventDetail);
    else {
      setEvent(null);
      toast.error(ev.error);
    }
    if (dash.success) setRegs(dash.data.registrations);
    else if (!user) setRegs([]);
    setLoading(false);
  }, [eventId, user]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const myReg = regs.find((r) => r.eventId === eventId && r.status === "REGISTERED");
  const ended = event ? eventHasEnded(event.date) : false;
  const canFeedback = !!user && !!myReg && ended;

  const onRegister = async () => {
    if (!user) {
      router.push(`/login?next=/events/${eventId}`);
      return;
    }
    setRegistering(true);
    const res = await apiPost<{
      registration: { id: string };
      idempotent: boolean;
    }>("/api/registrations", { eventId });
    setRegistering(false);
    if (!res.success) {
      if (res.error.toLowerCase().includes("full")) {
        toast.error("This event is full.");
      } else {
        toast.error(res.error);
      }
      return;
    }
    if (res.data.idempotent) {
      toast.info("You are already registered for this event.");
    } else {
      toast.success("You are registered!");
    }
    await refresh();
    void load();
  };

  const feedbackSubmit = form.handleSubmit(async (values) => {
    const res = await apiPost(`/api/events/${eventId}/feedback`, values);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Thanks for your feedback!");
    form.reset();
    setFeedbackOpen(false);
  });

  if (loading || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
      </div>
    );
  }

  const ev = event as EventDetail & {
    seatsTaken?: number;
    seatsAvailable?: number;
  };
  const seatsTaken = ev.seatsTaken ?? 0;
  const seatsAvailable =
    ev.seatsAvailable ?? Math.max(0, ev.seats - seatsTaken);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Button variant="ghost" asChild className="mb-6 gap-2">
        <Link href="/events">
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
      </Button>
      <div className="space-y-2">
        <Badge variant="secondary">{event.category}</Badge>
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        <p className="text-muted-foreground">
          Organized by {event.organizer.name}
        </p>
      </div>
      <Separator className="my-8" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
          <Calendar className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">When</p>
            <p className="text-sm text-muted-foreground">{formatEventDate(event.date)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
          <Users className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Capacity</p>
            <p className="text-sm text-muted-foreground">
              {seatsAvailable} spots left · {seatsTaken} registered
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 sm:col-span-2">
          <MapPin className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Venue & format</p>
            <p className="text-sm text-muted-foreground">
              On-campus venue and logistics are described below. Use the event details
              as your single source of truth for arrival and conduct rules.
            </p>
          </div>
        </div>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">About this event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p className="whitespace-pre-wrap text-foreground">{event.description}</p>
          <div>
            <p className="font-medium text-foreground">Guidelines</p>
            <p>
              Respect the host, arrive on time, and follow campus policies. For
              accessibility needs, contact the organizer listed above.
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 flex flex-wrap gap-3">
        {!ended && (
          <Button
            size="lg"
            disabled={registering || seatsAvailable <= 0 || !!myReg}
            onClick={() => void onRegister()}
          >
            {registering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : myReg ? (
              "Registered"
            ) : seatsAvailable <= 0 ? (
              "Event full"
            ) : (
              "Register"
            )}
          </Button>
        )}
        {ended && (
          <Badge variant="outline">This event has ended</Badge>
        )}
      </div>
      {canFeedback && (
        <Card className="mt-10 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5" />
              Feedback
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeedbackOpen((o) => !o)}
            >
              {feedbackOpen ? "Close" : "Leave feedback"}
            </Button>
          </CardHeader>
          {feedbackOpen && (
            <CardContent>
              <form onSubmit={feedbackSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1–5)</Label>
                  <input
                    id="rating"
                    type="number"
                    min={1}
                    max={5}
                    className="flex h-10 w-full max-w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register("rating", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea id="comment" {...form.register("comment")} />
                </div>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit feedback"
                  )}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

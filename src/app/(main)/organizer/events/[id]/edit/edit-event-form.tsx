"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet, apiPatch } from "@/lib/api";
import { RequireAuth } from "@/components/auth/require-auth";
import type { EventDetail } from "@/lib/types";
import { format } from "date-fns";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  category: z.string().min(1).max(100),
  date: z.string().min(1),
  seats: z.number().int().min(1).max(100000),
});

type Form = z.infer<typeof schema>;

export function EditEventForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    void (async () => {
      const res = await apiGet<{ event: EventDetail }>(`/api/events/${eventId}`);
      if (!res.success) {
        toast.error(res.error);
        router.replace("/organizer/events");
        return;
      }
      const e = res.data.event;
      const local = format(new Date(e.date), "yyyy-MM-dd'T'HH:mm");
      form.reset({
        title: e.title,
        description: e.description,
        category: e.category,
        date: local,
        seats: e.seats,
      });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form.reset on load only
  }, [eventId, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    const iso = new Date(values.date).toISOString();
    const res = await apiPatch(`/api/events/${eventId}`, {
      title: values.title,
      description: values.description,
      category: values.category,
      date: iso,
      seats: values.seats,
    });
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Event updated");
    router.push("/organizer/events");
    router.refresh();
  });

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <RequireAuth roles={["ORGANIZER", "ADMIN"]}>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Button variant="ghost" asChild className="mb-6 gap-2">
          <Link href="/organizer/events">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Edit event</CardTitle>
            <CardDescription>Changes apply immediately for attendees.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...form.register("title")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...form.register("category")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date & time</Label>
                  <Input id="date" type="datetime-local" {...form.register("date")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seats">Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min={1}
                    {...form.register("seats", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={8} {...form.register("description")} />
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}

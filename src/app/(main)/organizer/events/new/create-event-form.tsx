"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiPost } from "@/lib/api";
import { RequireAuth } from "@/components/auth/require-auth";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  category: z.string().min(1).max(100),
  date: z.string().min(1),
  seats: z.number().int().min(1).max(100000),
});

type Form = z.infer<typeof schema>;

export function CreateEventForm() {
  const router = useRouter();
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: "",
      seats: 30,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const iso = new Date(values.date).toISOString();
    const res = await apiPost<{ event: { id: string } }>("/api/events", {
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
    toast.success("Event created");
    router.push("/organizer/events");
    router.refresh();
  });

  return (
    <RequireAuth roles={["ORGANIZER", "ADMIN"]}>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>New event</CardTitle>
            <CardDescription>
              Published events appear on the public events page immediately.
            </CardDescription>
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
                <Label htmlFor="description">Description & guidelines</Label>
                <Textarea id="description" rows={8} {...form.register("description")} />
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Publish event"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}

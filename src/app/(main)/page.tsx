import Link from "next/link";
import { ArrowRight, Calendar, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            Built for students, organizers, and administrators
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Campus events,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              simplified
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Search upcoming events, register in seconds, manage your schedule, and
            run programs with a clean, modern experience.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="min-w-[180px] gap-2">
              <Link href="/events">
                Browse events
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-w-[180px]">
              <Link href="/register">Create an account</Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            {
              icon: Calendar,
              title: "Discover",
              desc: "Filter by category and date to find what matters to you.",
            },
            {
              icon: Users,
              title: "Register",
              desc: "Secure registration with live seat availability.",
            },
            {
              icon: Sparkles,
              title: "Organize",
              desc: "Create and manage events with an organizer-first workflow.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              <f.icon className="h-10 w-10 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

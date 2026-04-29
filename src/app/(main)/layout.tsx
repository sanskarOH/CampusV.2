import { SiteHeader } from "@/components/layout/site-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <DashboardShell>
        <main className="flex-1">{children}</main>
      </DashboardShell>
    </div>
  );
}

import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-background/80 px-4 py-4 backdrop-blur">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Campus Events
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center p-4">{children}</div>
    </div>
  );
}

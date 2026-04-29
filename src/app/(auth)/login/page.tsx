import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-40 w-full max-w-md animate-pulse rounded-xl bg-muted" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}

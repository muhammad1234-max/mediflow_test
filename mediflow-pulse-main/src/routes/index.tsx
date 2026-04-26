import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard", replace: true });
  },
  component: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">MediFlow</h1>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  ),
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { requireAuthSession } from "@/lib/auth-guard";
import { store } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    await requireAuthSession();
    const onboarded = store.get().user?.onboarded ?? false;
    if (!onboarded) throw redirect({ to: "/onboarding" });
  },
  component: AppLayout,
});

function AppLayout() {
  return <AppShell />;
}

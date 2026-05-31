import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { syncProfileFromAuth, useStore } from "@/lib/store";
import { usePlatformSettings } from "@/lib/platform.firestore";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const { settings, loading: settingsLoading } = usePlatformSettings();
  const onboarded = useStore((s) => s.user?.onboarded ?? false);

  useEffect(() => {
    if (!user?.email) return;
    syncProfileFromAuth(user.email, user.displayName ?? undefined);
  }, [user]);

  useEffect(() => {
    if (loading || settingsLoading) return;
    if (!user) {
      router.navigate({ to: "/login" });
      return;
    }
    if (settings.maintenanceMode && !isAdmin) {
      return;
    }
    if (!onboarded) {
      router.navigate({ to: "/onboarding" });
    }
  }, [user, loading, settingsLoading, onboarded, router, settings.maintenanceMode, isAdmin]);

  if (loading || settingsLoading || !user) return null;

  if (settings.maintenanceMode && !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-semibold">Under maintenance</h1>
          <p className="mt-2 text-muted-foreground">
            Smart Healthy Plate is temporarily unavailable. Please try again soon.
          </p>
          <Button className="mt-6 rounded-full" onClick={() => router.navigate({ to: "/login" })}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  if (!onboarded) return null;
  return <AppShell />;
}

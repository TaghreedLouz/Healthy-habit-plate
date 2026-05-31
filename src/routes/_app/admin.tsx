import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { baseRecipes } from "@/lib/recipes";
import { useAuth } from "@/lib/auth";
import {
  getUserRecord,
  listUserRecords,
  syncUserRecord,
  type AppUserRecord,
} from "@/lib/users.firestore";
import {
  useRecipeCatalog,
  mergeRecipeCatalog,
  getLatestFirestoreRecipe,
  countAiSavedRecipes,
} from "@/lib/recipes-catalog";
import { usePlatformSettings } from "@/lib/platform.firestore";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminRecipesTab } from "@/components/admin/AdminRecipesTab";
import { AdminPlatformTab } from "@/components/admin/AdminPlatformTab";
import { AdminAnalyticsTab } from "@/components/admin/AdminAnalyticsTab";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, ChefHat, Settings, Activity, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin — Smart Healthy Plate" }] }),
  component: AdminPage,
});

function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { settings } = usePlatformSettings();
  const { recipes, hiddenIds, firestoreRecipes } = useRecipeCatalog(true);
  const [users, setUsers] = useState<AppUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const firestoreIds = useMemo(
    () => new Set(firestoreRecipes.map((r) => r.id)),
    [firestoreRecipes],
  );

  const allRecipes = useMemo(
    () => mergeRecipeCatalog([], firestoreRecipes, { includeUnpublished: true }),
    [firestoreRecipes],
  );

  const latestRecipe = useMemo(
    () => getLatestFirestoreRecipe(firestoreRecipes),
    [firestoreRecipes],
  );

  const loadUsers = useCallback(async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setUsersError(null);

    console.debug("[admin users] current uid:", user.uid);

    try {
      try {
        await syncUserRecord(user);
      } catch {
        /* sync optional */
      }

      let selfRecord: AppUserRecord | null = null;
      try {
        selfRecord = await getUserRecord(user.uid);
      } catch {
        /* ignore */
      }
      console.debug("[admin users] current role:", selfRecord?.role ?? "unknown");

      const rows = await listUserRecords();
      setUsers(rows);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "code" in err
            ? String((err as { code: string }).code)
            : "Could not load users.";
      console.error("[admin users] load failed:", err);
      setUsers([]);
      setUsersError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) router.navigate({ to: "/dashboard" });
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin || authLoading) return;
    loadUsers();
  }, [isAdmin, authLoading, loadUsers, refreshKey]);

  const refreshRecipes = () => setRefreshKey((k) => k + 1);

  if (authLoading || !isAdmin) return null;

  const adminCount = users.filter((u) => u.role === "admin").length;
  const disabledCount = users.filter((u) => u.disabled).length;
  const aiSavedCount = countAiSavedRecipes(firestoreRecipes);
  const hiddenBuiltinCount = hiddenIds.filter((id) =>
    baseRecipes.some((r) => r.id === id),
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold">Admin panel</h1>
          <p className="mt-1 text-muted-foreground">
            Control users, recipes, announcements, and platform settings.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ChefHat} label="Total recipes" value={allRecipes.length} />
        <Stat icon={Users} label="Total users" value={users.length} />
        <Stat icon={Sparkles} label="AI recipes saved" value={aiSavedCount} />
        <Stat icon={Activity} label="Disabled users" value={disabledCount} />
      </div>

      {latestRecipe && (
        <Card className="rounded-3xl bg-secondary/40">
          <CardContent className="p-4 text-sm">
            <span className="font-medium">Latest Firestore recipe:</span>{" "}
            {latestRecipe.name}
            {latestRecipe.createdAt && (
              <span className="text-muted-foreground">
                {" "}
                · {new Date(latestRecipe.createdAt).toLocaleDateString()}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {(settings.maintenanceMode || !settings.signupEnabled) && (
        <Card className="rounded-3xl border-amber-500/40 bg-amber-500/10">
          <CardContent className="p-4 text-sm">
            {settings.maintenanceMode && <p>Maintenance mode is ON — regular users are blocked.</p>}
            {!settings.signupEnabled && <p>Sign-ups are currently disabled.</p>}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="recipes" className="space-y-4">
        <TabsList className="h-auto flex-wrap rounded-2xl p-1">
          <TabsTrigger value="recipes" className="rounded-xl">Recipes</TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl">Users</TabsTrigger>
          <TabsTrigger value="platform" className="rounded-xl">Platform</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl">Analytics</TabsTrigger>
        </TabsList>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <TabsContent value="recipes" className="mt-0">
              <AdminRecipesTab
                allRecipes={allRecipes}
                hiddenIds={hiddenIds}
                firestoreIds={firestoreIds}
                onRefresh={refreshRecipes}
              />
              <p className="mt-4 text-xs text-muted-foreground">
                Built-in library has {baseRecipes.length} recipes. Unpublished Firestore recipes are hidden from normal users.
              </p>
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              {isLoading && users.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading users…</p>
              ) : users.length === 0 && usersError ? (
                <p className="text-sm text-destructive">{usersError}</p>
              ) : (
                <>
                  {usersError && (
                    <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">{usersError}</p>
                  )}
                  <AdminUsersTab
                    users={users}
                    onUsersChange={setUsers}
                    currentUserId={user?.uid}
                    onReload={loadUsers}
                    isReloading={isLoading}
                  />
                </>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                {adminCount} admin{adminCount === 1 ? "" : "s"}
                {usersError ? " · deploy rules for full user management" : ""}
              </p>
            </TabsContent>

            <TabsContent value="platform" className="mt-0">
              <AdminPlatformTab />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <AdminAnalyticsTab
                allRecipes={allRecipes}
                firestoreRecipes={firestoreRecipes}
                hiddenCount={hiddenBuiltinCount}
                userCount={users.length}
                defaultIngredientCount={settings.defaultIngredients.length}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <Card className="rounded-3xl bg-primary/5">
        <CardContent className="flex items-center gap-3 p-6">
          <Settings className="h-5 w-5 text-primary" />
          <p className="text-sm">
            Deploy <code className="rounded bg-background px-1">npm run deploy:rules</code> after pulling rule updates so admin user management works.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
        <div className="mt-4 font-display text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

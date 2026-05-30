import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { recipes } from "@/lib/recipes";
import { useAuth } from "@/lib/auth";
import { requireAdminSession } from "@/lib/auth-guard";
import { listAllUsers, deleteUserById } from "@/lib/admin.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, ChefHat, Trash2, Activity } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: async () => {
    await requireAdminSession();
  },
  head: () => ({ meta: [{ title: "Admin — Smart Healthy Plate" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => listAllUsers(),
    enabled: isAdmin && !authLoading,
  });

  useEffect(() => {
    if (error) toast.error("Could not load users");
  }, [error]);

  if (authLoading || !isAdmin) return null;

  const adminCount = users.filter((u) => u.roles.includes("admin")).length;

  async function handleDelete(userId: string, email: string) {
    setDeletingId(userId);
    try {
      await deleteUserById({ data: { userId } });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(`Removed ${email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold">Admin panel</h1>
          <p className="mt-1 text-muted-foreground">Manage users, recipes, and platform health.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Users} label="Total users" value={users.length} />
        <Stat icon={Shield} label="Admins" value={adminCount} />
        <Stat icon={ChefHat} label="Recipes in library" value={recipes.length} />
      </div>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Users</h2>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2">Email</th><th>Joined</th><th>Last sign-in</th><th>Roles</th><th></th></tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 font-medium">{u.email}</td>
                      <td className="text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="text-muted-foreground">
                        {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((role) => (
                            <Badge
                              key={role}
                              variant={role === "admin" ? "default" : "secondary"}
                              className="rounded-full capitalize"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={u.roles.includes("admin") || deletingId === u.id}
                          onClick={() => handleDelete(u.id, u.email)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Recipe library</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {recipes.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-2xl border p-3">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.calories} kcal · {r.time} min</div>
                </div>
                <Badge variant="outline" className="rounded-full">{r.bestTime}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl bg-primary/5">
        <CardContent className="flex items-center gap-3 p-6">
          <Activity className="h-5 w-5 text-primary" />
          <p className="text-sm">
            Only the seeded admin account can access this panel. User management runs through
            JWT-protected server functions with role checks.
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

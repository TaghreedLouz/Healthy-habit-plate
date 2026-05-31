import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteUserRecord,
  resetUserOnboarding,
  setUserDisabled,
  setUserRole,
  updateUserName,
  type AppUserRecord,
} from "@/lib/users.firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ban, Check, Pencil, RefreshCw, RotateCcw, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface AdminUsersTabProps {
  users: AppUserRecord[];
  onUsersChange: (users: AppUserRecord[]) => void;
  currentUserId?: string;
  onReload?: () => void;
  isReloading?: boolean;
}

export function AdminUsersTab({
  users,
  onUsersChange,
  currentUserId,
  onReload,
  isReloading,
}: AdminUsersTabProps) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()),
  );

  async function reload() {
    if (onReload) {
      onReload();
    }
  }

  async function handleDelete(userId: string, email: string) {
    if (userId === currentUserId) {
      toast.error("You cannot delete your own admin account while logged in.");
      return;
    }
    setBusyId(userId);
    try {
      await deleteUserRecord(userId);
      onUsersChange(users.filter((u) => u.id !== userId));
      toast.success(`Removed ${email}`);
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleDisabled(u: AppUserRecord) {
    if (u.role === "admin") return;
    setBusyId(u.id);
    try {
      await setUserDisabled(u.id, !u.disabled);
      onUsersChange(
        users.map((row) =>
          row.id === u.id ? { ...row, disabled: !u.disabled } : row,
        ),
      );
      toast.success(u.disabled ? "User enabled" : "User disabled");
    } catch {
      toast.error("Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleResetOnboarding(u: AppUserRecord) {
    setBusyId(u.id);
    try {
      await resetUserOnboarding(u.id, u.email);
      toast.success(`Onboarding reset for ${u.email}`);
      await reload();
    } catch {
      toast.error("Reset failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRoleChange(userId: string, role: "admin" | "user") {
    if (userId === currentUserId && role !== "admin") {
      toast.error("You cannot remove your own admin role while logged in.");
      return;
    }
    setBusyId(userId);
    try {
      await setUserRole(userId, role);
      onUsersChange(users.map((u) => (u.id === userId ? { ...u, role } : u)));
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error("Role update failed — deploy updated Firestore rules");
    } finally {
      setBusyId(null);
    }
  }

  async function saveName(userId: string) {
    setBusyId(userId);
    try {
      await updateUserName(userId, editName);
      onUsersChange(
        users.map((u) => (u.id === userId ? { ...u, name: editName.trim() || "Friend" } : u)),
      );
      setEditingId(null);
      toast.success("Name updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm rounded-full"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={isReloading}
          onClick={() => onReload?.()}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isReloading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-2">Email</th>
              <th>Name</th>
              <th>Joined</th>
              <th>Last login</th>
              <th>Status</th>
              <th>Role</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="py-3 font-medium">{u.email}</td>
                <td className="text-muted-foreground">
                  {editingId === u.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 w-36"
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveName(u.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    u.name
                  )}
                </td>
                <td className="text-muted-foreground">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="text-muted-foreground">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—"}
                </td>
                <td>
                  {u.disabled ? (
                    <Badge variant="destructive" className="rounded-full">Disabled</Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full">Active</Badge>
                  )}
                </td>
                <td>
                  {u.id === currentUserId ? (
                    <Badge variant="default" className="rounded-full capitalize">
                      {u.role}
                    </Badge>
                  ) : (
                    <Select
                      value={u.role}
                      onValueChange={(v) => handleRoleChange(u.id, v as "admin" | "user")}
                      disabled={busyId === u.id}
                    >
                      <SelectTrigger className="h-8 w-28 rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Edit name"
                      disabled={busyId === u.id}
                      onClick={() => {
                        setEditingId(u.id);
                        setEditName(u.name);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {u.role !== "admin" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        title={u.disabled ? "Enable user" : "Disable user"}
                        disabled={busyId === u.id}
                        onClick={() => handleToggleDisabled(u)}
                      >
                        {u.disabled ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Reset onboarding"
                      disabled={busyId === u.id}
                      onClick={() => handleResetOnboarding(u)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={u.role === "admin" || busyId === u.id}
                      onClick={() => handleDelete(u.id, u.email)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {users.length === 0 ? "No users found in Firestore yet." : "No users match your search."}
          </p>
        )}
      </div>
    </div>
  );
}

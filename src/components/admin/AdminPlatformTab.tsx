import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_PLATFORM_SETTINGS,
  getPlatformSettings,
  savePlatformSettings,
  type PlatformSettings,
} from "@/lib/platform.firestore";
import { toast } from "sonner";

export function AdminPlatformTab() {
  const [form, setForm] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPlatformSettings()
      .then(setForm)
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const saved = await savePlatformSettings({
        ...form,
        defaultIngredients: form.defaultIngredients.filter(Boolean),
      });
      setForm(saved);
      toast.success("Platform settings saved");
    } catch {
      toast.error("Save failed — deploy Firestore rules if needed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border p-4">
        <h3 className="font-medium">Site controls</h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Maintenance mode</div>
            <div className="text-xs text-muted-foreground">Blocks regular users from the app (admins can still access).</div>
          </div>
          <Switch
            checked={form.maintenanceMode}
            onCheckedChange={(maintenanceMode) => setForm({ ...form, maintenanceMode })}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Allow new sign-ups</div>
            <div className="text-xs text-muted-foreground">Turn off to close registration.</div>
          </div>
          <Switch
            checked={form.signupEnabled}
            onCheckedChange={(signupEnabled) => setForm({ ...form, signupEnabled })}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border p-4">
        <h3 className="font-medium">Announcement banner</h3>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-medium">Show banner to all users</div>
          <Switch
            checked={form.announcementEnabled}
            onCheckedChange={(announcementEnabled) => setForm({ ...form, announcementEnabled })}
          />
        </div>
        <div>
          <Label>Message</Label>
          <Textarea
            rows={2}
            placeholder="e.g. New recipes added this week!"
            value={form.announcement}
            onChange={(e) => setForm({ ...form, announcement: e.target.value })}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border p-4">
        <h3 className="font-medium">Contact & ingredients</h3>
        <div>
          <Label>Contact email (shown on Contact page)</Label>
          <Input
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
          />
        </div>
        <div>
          <Label>Default ingredient suggestions</Label>
          <Textarea
            rows={4}
            value={form.defaultIngredients.join("\n")}
            onChange={(e) =>
              setForm({
                ...form,
                defaultIngredients: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
          <p className="mt-1 text-xs text-muted-foreground">One ingredient per line — shown on the Ingredients page.</p>
        </div>
      </section>

      <Button className="rounded-full" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save platform settings"}
      </Button>
    </div>
  );
}

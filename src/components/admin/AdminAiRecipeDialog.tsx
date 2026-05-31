import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RECIPE_CATEGORIES, type Recipe } from "@/lib/recipes";
import { saveAiRecipeToLibrary } from "@/lib/recipes-catalog";
import { DEFAULT_RECIPE_IMAGE } from "@/lib/recipe-image-utils";
import { toast } from "sonner";

interface AdminAiRecipeDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function AdminAiRecipeDialog({
  recipe,
  open,
  onClose,
  onSaved,
}: AdminAiRecipeDialogProps) {
  const [form, setForm] = useState<Recipe | null>(recipe);
  const [busy, setBusy] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setForm(recipe);
    setImgError(false);
  }, [recipe]);

  if (!form) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form?.name.trim()) return toast.error("Recipe name is required");
    setBusy(true);
    try {
      await saveAiRecipeToLibrary({
        ...form,
        ingredients: form.ingredients.filter(Boolean),
        addOns: form.addOns.filter(Boolean),
        steps: form.steps.filter(Boolean),
      });
      toast.success("AI recipe published to library");
      onSaved?.();
      onClose();
    } catch {
      toast.error("Save failed — check admin role and Firestore rules");
    } finally {
      setBusy(false);
    }
  }

  function listField(
    label: string,
    key: "ingredients" | "addOns" | "steps",
    placeholder: string,
  ) {
    return (
      <div>
        <Label>{label}</Label>
        <Textarea
          rows={3}
          placeholder={placeholder}
          value={form[key].join("\n")}
          onChange={(e) =>
            setForm({
              ...form,
              [key]: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </div>
    );
  }

  function toggleCategory(cat: string) {
    const set = new Set(form.categories ?? []);
    if (set.has(cat)) set.delete(cat);
    else set.add(cat);
    setForm({ ...form, categories: [...set] });
  }

  const previewSrc = imgError || !form.image ? DEFAULT_RECIPE_IMAGE : form.image;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve AI recipe</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input
              value={form.image}
              onChange={(e) => {
                setImgError(false);
                setForm({ ...form, image: e.target.value });
              }}
            />
            <img
              src={previewSrc}
              alt={form.name}
              className="mt-2 aspect-video w-full rounded-2xl object-cover"
              onError={() => setImgError(true)}
            />
          </div>
          {listField("Main ingredients", "ingredients", "Apple\nYogurt")}
          {listField("Steps", "steps", "Mix ingredients.\nServe chilled.")}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Calories</Label>
              <Input
                type="number"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Health score</Label>
              <Input
                type="number"
                value={form.health}
                onChange={(e) => setForm({ ...form, health: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label>Best time</Label>
            <Select
              value={form.bestTime}
              onValueChange={(v) => setForm({ ...form, bestTime: v as Recipe["bestTime"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Categories</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {RECIPE_CATEGORIES.map((cat) => {
                const active = (form.categories ?? []).includes(cat);
                return (
                  <Badge
                    key={cat}
                    variant={active ? "default" : "outline"}
                    className="cursor-pointer rounded-full"
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </Badge>
                );
              })}
            </div>
          </div>
          <div>
            <Label>Why it&apos;s healthy</Label>
            <Textarea
              rows={2}
              value={form.why}
              onChange={(e) => setForm({ ...form, why: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Publishing…" : "Publish to library"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

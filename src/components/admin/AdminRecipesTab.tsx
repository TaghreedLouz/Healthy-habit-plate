import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { baseRecipes, RECIPE_CATEGORIES, type Recipe } from "@/lib/recipes";
import {
  deleteRecipe,
  saveRecipe,
  setRecipePublished,
  slugifyRecipeName,
} from "@/lib/recipes-catalog";
import { savePlatformSettings } from "@/lib/platform.firestore";
import { DEFAULT_RECIPE_IMAGE } from "@/lib/recipe-image-utils";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyRecipe = (): Recipe => ({
  id: "",
  name: "",
  description: "",
  image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
  ingredients: [],
  addOns: [],
  steps: [],
  time: 20,
  servings: 1,
  calories: 400,
  protein: 20,
  carbs: 40,
  fats: 12,
  health: 85,
  bestTime: "Lunch",
  why: "",
  published: true,
  categories: [],
});

interface AdminRecipesTabProps {
  allRecipes: Recipe[];
  hiddenIds: string[];
  firestoreIds: Set<string>;
  onRefresh: () => void;
}

export function AdminRecipesTab({
  allRecipes,
  hiddenIds,
  firestoreIds,
  onRefresh,
}: AdminRecipesTabProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Recipe>(emptyRecipe());
  const [isNew, setIsNew] = useState(true);
  const [busy, setBusy] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hiddenSet = new Set(hiddenIds);
  const baseIds = new Set(baseRecipes.map((r) => r.id));

  useEffect(() => {
    if (open) setImgError(false);
  }, [open, form.image]);

  function openCreate() {
    setForm(emptyRecipe());
    setIsNew(true);
    setOpen(true);
  }

  function openEdit(r: Recipe) {
    setForm({ ...r, categories: r.categories ?? [], published: r.published !== false });
    setIsNew(false);
    setOpen(true);
  }

  function toggleCategory(cat: string) {
    const set = new Set(form.categories ?? []);
    if (set.has(cat)) set.delete(cat);
    else set.add(cat);
    setForm({ ...form, categories: [...set] });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Recipe name is required");
    setBusy(true);
    try {
      const id = form.id.trim() || slugifyRecipeName(form.name) || crypto.randomUUID();
      await saveRecipe({
        ...form,
        id,
        ingredients: form.ingredients.filter(Boolean),
        addOns: form.addOns.filter(Boolean),
        steps: form.steps.filter(Boolean),
        published: form.published !== false,
      });
      toast.success(isNew ? "Recipe added" : "Recipe updated");
      setOpen(false);
      onRefresh();
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleHidden(id: string) {
    const next = hiddenSet.has(id)
      ? hiddenIds.filter((x) => x !== id)
      : [...hiddenIds, id];
    try {
      await savePlatformSettings({ hiddenRecipeIds: next });
      toast.success(hiddenSet.has(id) ? "Recipe visible again" : "Recipe hidden");
      onRefresh();
    } catch {
      toast.error("Update failed");
    }
  }

  async function togglePublished(r: Recipe) {
    if (!firestoreIds.has(r.id)) {
      toast.error("Publish/unpublish applies to Firestore recipes. Save as custom first.");
      return;
    }
    setBusy(true);
    try {
      await setRecipePublished(r.id, r, r.published === false);
      toast.success(r.published === false ? "Recipe published" : "Recipe unpublished");
      onRefresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!firestoreIds.has(id)) {
      return toggleHidden(id);
    }
    setBusy(true);
    try {
      await deleteRecipe(id);
      toast.success("Recipe deleted");
      onRefresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusy(false);
    }
  }

  function listField(
    label: string,
    key: "ingredients" | "addOns" | "steps",
    placeholder: string,
  ) {
    const value = form[key].join("\n");
    return (
      <div>
        <Label>{label}</Label>
        <Textarea
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={(e) =>
            setForm({
              ...form,
              [key]: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
            })
          }
        />
        <p className="mt-1 text-xs text-muted-foreground">One item per line</p>
      </div>
    );
  }

  const previewSrc = imgError || !form.image ? DEFAULT_RECIPE_IMAGE : form.image;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {allRecipes.length} in catalog · {hiddenIds.length} hidden · {firestoreIds.size} in Firestore
        </p>
        <Button className="rounded-full" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> Add recipe
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {allRecipes.map((r) => {
          const isHidden = hiddenSet.has(r.id);
          const isCustom = firestoreIds.has(r.id) && !baseIds.has(r.id);
          const isOverride = firestoreIds.has(r.id) && baseIds.has(r.id);
          const isDraft = firestoreIds.has(r.id) && r.published === false;
          return (
            <div
              key={r.id}
              className={`flex items-center justify-between rounded-2xl border p-3 ${isHidden || isDraft ? "opacity-60" : ""}`}
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  {r.source === "ai" && (
                    <Badge variant="secondary" className="rounded-full text-xs">AI</Badge>
                  )}
                  {isCustom && <Badge variant="secondary" className="rounded-full text-xs">Custom</Badge>}
                  {isOverride && <Badge variant="outline" className="rounded-full text-xs">Edited</Badge>}
                  {isHidden && <Badge variant="destructive" className="rounded-full text-xs">Hidden</Badge>}
                  {isDraft && <Badge variant="outline" className="rounded-full text-xs">Draft</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.calories} kcal · {r.time} min · {r.bestTime}
                  {(r.categories ?? []).length > 0 && ` · ${r.categories?.join(", ")}`}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                {firestoreIds.has(r.id) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    title={r.published === false ? "Publish" : "Unpublish"}
                    disabled={busy}
                    onClick={() => togglePublished(r)}
                  >
                    {r.published === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                )}
                {!firestoreIds.has(r.id) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    title={isHidden ? "Show recipe" : "Hide recipe"}
                    onClick={() => toggleHidden(r.id)}
                  >
                    {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                )}
                {(isCustom || isOverride) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => handleDelete(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add recipe" : "Edit recipe"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
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
                alt={form.name || "Preview"}
                className="mt-2 aspect-video w-full rounded-2xl object-cover"
                onError={() => setImgError(true)}
              />
            </div>
            {listField("Main ingredients", "ingredients", "Chicken\nRice")}
            {listField("Add-ons", "addOns", "Lemon\nOlive oil")}
            {listField("Steps", "steps", "Cook rice.\nGrill chicken.")}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Time (min)</Label><Input type="number" value={form.time} onChange={(e) => setForm({ ...form, time: Number(e.target.value) })} /></div>
              <div><Label>Health score</Label><Input type="number" value={form.health} onChange={(e) => setForm({ ...form, health: Number(e.target.value) })} /></div>
              <div><Label>Calories</Label><Input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} /></div>
              <div><Label>Protein (g)</Label><Input type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })} /></div>
              <div><Label>Carbs (g)</Label><Input type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })} /></div>
              <div><Label>Fats (g)</Label><Input type="number" value={form.fats} onChange={(e) => setForm({ ...form, fats: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label>Best time</Label>
              <Select value={form.bestTime} onValueChange={(v) => setForm({ ...form, bestTime: v as Recipe["bestTime"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
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
            <div className="flex items-center justify-between rounded-2xl border p-3">
              <div>
                <div className="text-sm font-medium">Published</div>
                <div className="text-xs text-muted-foreground">Unpublished recipes are admin-only.</div>
              </div>
              <Switch
                checked={form.published !== false}
                onCheckedChange={(published) => setForm({ ...form, published })}
              />
            </div>
            <div><Label>Why it's healthy</Label><Textarea rows={2} value={form.why} onChange={(e) => setForm({ ...form, why: e.target.value })} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save recipe"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

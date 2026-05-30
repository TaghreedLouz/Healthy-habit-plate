import { createFileRoute } from "@tanstack/react-router";
import { useStore, store, type Reminder } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, Droplet, Footprints, UtensilsCrossed, Weight, Sparkles, Plus, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/reminders")({
  head: () => ({ meta: [{ title: "Reminders — Smart Healthy Plate" }] }),
  component: Reminders,
});

const iconFor: Record<Reminder["type"], any> = {
  water: Droplet, walk: Footprints, meal: UtensilsCrossed, weight: Weight, habit: Sparkles,
};

function Reminders() {
  const reminders = useStore((s) => s.reminders);
  const [text, setText] = useState("");
  const [time, setTime] = useState("12:00");

  function toggle(id: string) {
    store.set((s) => ({ ...s, reminders: s.reminders.map((r) => r.id === id ? {...r, enabled:!r.enabled} : r) }));
  }
  function remove(id: string) {
    store.set((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) }));
  }
  function add() {
    if (!text) return;
    store.set((s) => ({ ...s, reminders: [...s.reminders, { id: crypto.randomUUID(), type: "habit", time, text, enabled: true }] }));
    setText("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Reminders</h1>
        <p className="mt-1 text-muted-foreground">Gentle nudges throughout the day.</p>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <div className="mb-3 text-sm font-medium">Add a custom reminder</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input className="sm:w-32" type="time" value={time} onChange={(e)=>setTime(e.target.value)}/>
            <Input placeholder="Take a stretch break" value={text} onChange={(e)=>setText(e.target.value)}/>
            <Button className="rounded-full" onClick={add}><Plus className="mr-1 h-4 w-4"/>Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {reminders.map((r) => {
          const Icon = iconFor[r.type] ?? Bell;
          return (
            <Card key={r.id} className="rounded-3xl">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`grid h-10 w-10 place-items-center rounded-2xl ${r.enabled ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  <Icon className="h-5 w-5"/>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{r.text}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{r.type} · {r.time}</div>
                </div>
                <Switch checked={r.enabled} onCheckedChange={()=>toggle(r.id)}/>
                <Button size="icon" variant="ghost" onClick={()=>remove(r.id)}><X className="h-4 w-4"/></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

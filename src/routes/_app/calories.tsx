import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addMeal, removeMeal, useStore, calcTargets, todayStr } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_app/calories")({
  head: () => ({ meta: [{ title: "Calories tracker — Smart Healthy Plate" }] }),
  component: Calories,
});

const slots = ["breakfast","lunch","dinner","snack"] as const;

function Calories() {
  const allMeals = useStore((s) => s.meals);
  const meals = allMeals.filter((m) => m.date === todayStr());
  const user = useStore((s) => s.user);
  const target = calcTargets(user).calories;
  const totals = meals.reduce((a, m) => ({
    cal: a.cal + m.calories, p: a.p + m.protein, c: a.c + m.carbs, f: a.f + m.fats,
  }), {cal:0,p:0,c:0,f:0});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold">Calories tracker</h1>
          <p className="mt-1 text-muted-foreground">You consumed {totals.cal} / {target} kcal — {Math.max(0,target-totals.cal)} kcal remaining.</p>
        </div>
        <AddMealDialog />
      </div>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <Progress value={Math.min(100, totals.cal/target*100)} className="h-3"/>
          <div className="mt-4 grid grid-cols-4 gap-3 text-center">
            <Tot v={totals.cal} l="kcal"/>
            <Tot v={`${totals.p}g`} l="protein"/>
            <Tot v={`${totals.c}g`} l="carbs"/>
            <Tot v={`${totals.f}g`} l="fats"/>
          </div>
        </CardContent>
      </Card>

      {slots.map((slot) => {
        const items = meals.filter((m) => m.slot === slot);
        return (
          <Card key={slot} className="rounded-3xl">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold capitalize">{slot}</h2>
                <div className="text-sm text-muted-foreground">{items.reduce((a,m)=>a+m.calories,0)} kcal</div>
              </div>
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">Nothing logged yet.</div>
              ) : (
                <ul className="divide-y">
                  {items.map((m) => (
                    <li key={m.id} className="flex items-center justify-between py-2.5">
                      <div className="text-sm">{m.name}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">{m.calories} kcal</div>
                        <Button size="icon" variant="ghost" onClick={()=>removeMeal(m.id)}><X className="h-4 w-4"/></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Tot({ v, l }: any) {
  return (<div><div className="font-display text-2xl font-semibold">{v}</div><div className="text-xs text-muted-foreground">{l}</div></div>);
}

function AddMealDialog() {
  const [open, setOpen] = useState(false);
  const [m, setM] = useState({ name:"", slot:"breakfast" as any, calories:0, protein:0, carbs:0, fats:0 });
  function save() {
    if (!m.name) return;
    addMeal(m);
    setM({ name:"", slot:"breakfast", calories:0, protein:0, carbs:0, fats:0 });
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="rounded-full"><Plus className="mr-1 h-4 w-4"/>Add meal</Button></DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle>Add a meal</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={m.name} onChange={(e)=>setM({...m,name:e.target.value})}/></div>
          <div>
            <Label>Meal</Label>
            <Select value={m.slot} onValueChange={(v)=>setM({...m,slot:v as any})}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{slots.map((s)=><SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div><Label>kcal</Label><Input type="number" value={m.calories} onChange={(e)=>setM({...m,calories:+e.target.value})}/></div>
            <div><Label>P</Label><Input type="number" value={m.protein} onChange={(e)=>setM({...m,protein:+e.target.value})}/></div>
            <div><Label>C</Label><Input type="number" value={m.carbs} onChange={(e)=>setM({...m,carbs:+e.target.value})}/></div>
            <div><Label>F</Label><Input type="number" value={m.fats} onChange={(e)=>setM({...m,fats:+e.target.value})}/></div>
          </div>
          <Button className="w-full rounded-full" onClick={save}>Add</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

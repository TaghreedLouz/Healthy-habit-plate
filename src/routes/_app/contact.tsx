import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, MapPin, Send } from "lucide-react";

export const Route = createFileRoute("/_app/contact")({
  head: () => ({ meta: [{ title: "Contact — Smart Healthy Plate" }] }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill all fields");
    toast.success("Thanks — we'll get back to you soon!");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Get in touch</h1>
        <p className="mt-1 text-muted-foreground">Questions, feedback, or just saying hi — we'd love to hear from you.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-3xl lg:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></div>
              </div>
              <div><Label>Message</Label><Textarea rows={6} value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})}/></div>
              <Button type="submit" className="rounded-full"><Send className="mr-1 h-4 w-4"/>Send message</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-3xl"><CardContent className="p-5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary"><Mail className="h-5 w-5"/></div>
            <div className="mt-3 font-medium">hello@smarthealthyplate.app</div>
            <div className="text-sm text-muted-foreground">We reply within 24 hours.</div>
          </CardContent></Card>
          <Card className="rounded-3xl"><CardContent className="p-5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/20 text-accent-foreground"><MapPin className="h-5 w-5"/></div>
            <div className="mt-3 font-medium">Made for healthy lifestyles</div>
            <div className="text-sm text-muted-foreground">A university project · 2026</div>
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}

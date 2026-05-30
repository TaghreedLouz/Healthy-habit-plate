import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, ChefHat, Flame, Droplet, Footprints, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Healthy Plate — Cook smart. Eat healthy." },
      { name: "description", content: "Get healthy recipes from ingredients you already have, then track calories, water, steps and weight in one friendly dashboard." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold">Smart Healthy Plate</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" className="rounded-full">Log in</Button></Link>
          <Link to="/signup"><Button className="rounded-full">Get started</Button></Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Personalized healthy eating
            </div>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl">
              Cook smart. <br/>
              <span className="text-primary">Eat healthy.</span> <br/>
              Track your progress.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Tell us what's in your kitchen — we'll suggest balanced recipes, calculate the calories, and
              keep you on top of water, steps, weight, and your goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" className="rounded-full">
                  Start free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="rounded-full">I already have an account</Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <Stat n="120+" label="Healthy recipes" />
              <Stat n="4-in-1" label="Daily tracker" />
              <Stat n="100%" label="Free for students" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] border bg-card shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=80"
                alt="Healthy chicken rice bowl with vegetables"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <FloatCard className="absolute -left-4 top-10 hidden sm:block">
              <Flame className="h-5 w-5 text-accent" />
              <div>
                <div className="text-xs text-muted-foreground">Today</div>
                <div className="font-semibold">1,250 / 1,800 kcal</div>
              </div>
            </FloatCard>
            <FloatCard className="absolute -right-4 bottom-10 hidden sm:flex">
              <Droplet className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Hydration</div>
                <div className="font-semibold">6 / 8 cups</div>
              </div>
            </FloatCard>
          </div>
        </div>
      </section>

      <section className="border-y bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Everything you need for a healthier day</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">From "what's in my fridge?" to weekly progress charts — all in one calm space.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={ChefHat} title="Smart recipes" text="Suggestions based on your ingredients with simple add-ons and a health score." />
            <Feature icon={Flame} title="Calorie tracker" text="Log meals, see macros, and watch your daily calorie target in real time." />
            <Feature icon={Droplet} title="Water & reminders" text="Stay hydrated with gentle nudges through the day." />
            <Feature icon={Footprints} title="Steps tracker" text="Set a goal, log your walking, and see calories burned." />
            <Feature icon={TrendingUp} title="Weekly progress" text="Beautiful charts for weight, calories, water and steps." />
            <Feature icon={Sparkles} title="Personal plan" text="Custom calorie, water and step targets based on your goal." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-display text-4xl font-semibold">Ready to plate up?</h2>
        <p className="mt-3 text-muted-foreground">It takes 60 seconds to set up your personalized plan.</p>
        <Link to="/signup"><Button size="lg" className="mt-6 rounded-full">Create your account</Button></Link>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Smart Healthy Plate · <Link to="/contact" className="underline-offset-4 hover:underline">Contact</Link>
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-xl font-semibold">{n}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-3xl border bg-card p-6 transition hover:shadow-md">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function FloatCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

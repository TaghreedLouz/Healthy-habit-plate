import { Link, Outlet, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard, Carrot, ChefHat, CalendarDays, Flame, Droplet,
  Footprints, TrendingUp, Bookmark, Bell, User, Mail, LogOut, Leaf, Menu, Shield, Megaphone,
} from "lucide-react";
import { useState } from "react";
import { useStore, clearLocalProfile } from "@/lib/store";
import { useAuth, signOut } from "@/lib/auth";
import { usePlatformSettings } from "@/lib/platform.firestore";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const baseNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ingredients", label: "Ingredients", icon: Carrot },
  { to: "/recipes", label: "Recipes", icon: ChefHat },
  { to: "/meal-plan", label: "Meal Plan", icon: CalendarDays },
  { to: "/calories", label: "Calories", icon: Flame },
  { to: "/water", label: "Water", icon: Droplet },
  { to: "/steps", label: "Steps", icon: Footprints },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/contact", label: "Contact", icon: Mail },
];
const adminItem = { to: "/admin", label: "Admin", icon: Shield };

function isNavActive(path: string, to: string) {
  if (path === to) return true;
  if (to === "/dashboard") return false;
  return path.startsWith(`${to}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouter().state.location.pathname;
  const { isAdmin } = useAuth();
  const nav = isAdmin ? [...baseNav, adminItem] : baseNav;
  return (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((n) => {
        const active = isNavActive(path, n.to);
        const Icon = n.icon;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/70 hover:bg-secondary hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className={cn("h-4 w-4", active && "text-primary-foreground")} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2 px-5 pt-6">
      <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <Leaf className="h-5 w-5" />
      </div>
      <div className="font-display text-lg font-semibold leading-tight">
        Smart Healthy<br/>Plate
      </div>
    </Link>
  );
}

export function AppShell() {
  const user = useStore((s) => s.user);
  const { settings } = usePlatformSettings();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOut();
      clearLocalProfile();
      await router.navigate({ to: "/login" });
    } catch {
      toast.error("Could not log out. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <Brand />
        <div className="mt-6 flex-1 overflow-y-auto"><NavLinks /></div>
        <div className="border-t p-3">
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-2xl" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <Brand />
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="border-t p-3">
              <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="font-display text-lg font-semibold">Smart Healthy Plate</div>
        <div className="h-8 w-8 rounded-full bg-primary/15 grid place-items-center text-xs font-semibold text-primary">
          {user?.name?.[0]?.toUpperCase() ?? "S"}
        </div>
      </header>

      <main className="lg:pl-64">
        {settings.announcementEnabled && settings.announcement.trim() && (
          <div className="border-b bg-primary/10 px-4 py-2.5 text-sm">
            <div className="mx-auto flex max-w-6xl items-center gap-2 text-foreground/90">
              <Megaphone className="h-4 w-4 shrink-0 text-primary" />
              <span>{settings.announcement}</span>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

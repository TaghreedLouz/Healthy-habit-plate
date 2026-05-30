import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserIsAdmin } from "@/lib/auth";

export async function requireAuthSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw redirect({ to: "/login" });
  return session;
}

export async function requireAdminSession() {
  const session = await requireAuthSession();
  const isAdmin = await fetchUserIsAdmin(session.user.id);
  if (!isAdmin) throw redirect({ to: "/dashboard" });
  return session;
}

export async function redirectIfAuthenticated() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) throw redirect({ to: "/dashboard" });
}

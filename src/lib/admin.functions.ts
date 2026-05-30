import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth.functions";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { data: usersResp, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (usersErr) throw new Error(usersErr.message);

    const { data: roles, error: rolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role");
    if (rolesErr) throw new Error(rolesErr.message);

    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }

    return usersResp.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      roles: roleMap.get(u.id) ?? [],
    }));
  });

export const deleteUserById = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) {
      throw new Error("You cannot delete your own admin account");
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

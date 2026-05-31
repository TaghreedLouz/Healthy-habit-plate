/**
 * Seeds the single system admin via Supabase Auth Admin API (bcrypt-hashed password).
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
 *
 * Usage: node scripts/seed-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "admin@smarthealthyplate.com";
const ADMIN_PASSWORD = "00000000";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env and retry.",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(email) {
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

async function main() {
  let user = await findUserByEmail(ADMIN_EMAIL);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: "Admin" },
    });
    if (error) throw error;
    user = data.user;
    console.log("Created admin auth user (password stored as bcrypt hash).");
  } else {
    console.log("Admin auth user already exists.");
  }

  const { data: existingAdminRole } = await admin
    .from("user_roles")
    .select("id, user_id")
    .eq("role", "admin")
    .maybeSingle();

  if (existingAdminRole && existingAdminRole.user_id !== user.id) {
    throw new Error(
      "Another admin already exists. Only one admin is allowed in the system.",
    );
  }

  if (!existingAdminRole) {
    const { error: roleErr } = await admin.from("user_roles").insert({
      user_id: user.id,
      role: "admin",
    });
    if (roleErr) throw roleErr;
    console.log("Assigned admin role.");
  } else {
    console.log("Admin role already assigned.");
  }

  console.log(`Done. Sign in with ${ADMIN_EMAIL}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

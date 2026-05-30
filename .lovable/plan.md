# Secure auth + RBAC

## Approach

Use **Lovable Cloud** (managed Supabase) for auth. This satisfies every requirement out of the box:

| Requirement | How Lovable Cloud meets it |
|---|---|
| Email/password login | `supabase.auth.signInWithPassword` |
| JWT-based auth | Supabase issues a signed JWT per session, auto-attached to all server-fn calls via the bearer attacher |
| bcrypt password hashing | Supabase Auth hashes passwords server-side (bcrypt). Plain passwords never touch our DB or code |
| Secrets never exposed | JWT signing key + service role key live server-side only; client only ever sees the publishable key |

A custom JWT+bcrypt stack in TanStack server functions is technically possible but would re-implement what Supabase already provides securely — and would force us to manage our own key rotation, session refresh, and password reset. Recommending the managed path.

## What gets built

### 1. Enable Lovable Cloud
Provisions Postgres + Auth. No external account needed.

### 2. Roles schema (migration)
Per the platform's secure RBAC pattern — roles live in their own table, never on the profile, to prevent privilege escalation.

```sql
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

-- SECURITY DEFINER role check (avoids recursive RLS)
create function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read their own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

-- Auto-assign 'user' role on signup
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 3. Seed the single admin
Run once via SQL in the Cloud project:
- Create the user `admin@smarthealthyplate.com` with password `00000000` through Supabase Auth admin API (so it gets bcrypt-hashed).
- Insert the `admin` role into `user_roles` for that user id.
- Add a CHECK-style enforcement: a partial unique index `create unique index only_one_admin on public.user_roles ((role)) where role = 'admin';` guarantees no second admin can ever exist.

You will be warned that `00000000` is weak — keeping it because the spec mandates it, but I'll recommend rotating it after first login.

### 4. Frontend auth flow
- `/login` — email + password form → `signInWithPassword`
- `/signup` — email + password → `signUp` (assigns `user` role via trigger)
- `/forgot-password` + `/reset-password` — `resetPasswordForEmail` flow
- Root `__root.tsx` wires `onAuthStateChange` → invalidates router + query cache
- `useCurrentUser()` hook exposes `{ user, isAdmin, loading }` by reading session + querying `user_roles`

### 5. Route protection (TanStack pattern)
- `src/routes/_authenticated.tsx` — pathless layout. `beforeLoad` checks `supabase.auth.getUser()`, redirects to `/login` if missing. All app routes (`dashboard`, `recipes`, etc.) move under it.
- `src/routes/_authenticated/_admin.tsx` — nested pathless layout. `beforeLoad` calls a `requireAdmin` server fn that uses `has_role(auth.uid(), 'admin')`; throws redirect to `/dashboard` if false. The `/admin` route moves under this.

### 6. Server-side enforcement
All admin server functions use the `requireSupabaseAuth` middleware + an additional `requireAdmin` middleware that calls `has_role`. RLS on every admin-writable table also requires `has_role(auth.uid(), 'admin')` as backstop — middleware is primary gate, RLS is defense-in-depth.

### 7. UI hiding
Sidebar in `AppShell` filters out the "Admin" link unless `isAdmin === true`. The admin route is still server-protected even if a user hand-types the URL.

## Files touched / created

**New**
- `supabase` migration with the schema above
- `src/lib/auth.ts` — `useCurrentUser`, `useIsAdmin` hooks
- `src/lib/auth.functions.ts` — `requireAdmin` middleware + `getMyRoles` server fn
- `src/routes/_authenticated.tsx`, `src/routes/_authenticated/_admin.tsx`
- `src/routes/reset-password.tsx`

**Replaced**
- `src/routes/login.tsx`, `signup.tsx`, `forgot-password.tsx` — wired to Supabase Auth instead of the localStorage stub
- `src/routes/_app.tsx` and all `src/routes/_app/*` files move under `_authenticated/`
- `src/components/AppShell.tsx` — conditional admin link, real `signOut` button
- `src/lib/store.ts` — `authed`/`user` fields removed; only meal/water/steps/etc. local state remains
- `src/start.ts` — append `attachSupabaseAuth` to `functionMiddleware`

## Order of operations (after approval)
1. Build the healthy-habit-plate clone (still pending from the previous plan).
2. Enable Lovable Cloud.
3. Run the migration.
4. Seed the admin user via SQL.
5. Wire frontend + middleware.
6. Verify: signup as new user → role 'user' → no admin link; sign in as admin → admin route works; try hitting `/admin` as a regular user → redirected.

## Confirm before I proceed
- OK to bundle this on top of the clone (build clone first, then auth) in a single implementation pass? Or implement auth alone now and clone later?
- Password `00000000` is below any reasonable strength bar. Keep as the seed value per spec, then prompt you to rotate it on first admin login. Confirm?

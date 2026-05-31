-- Defense in depth: authenticated users may only read roles (never write).
revoke insert, update, delete on public.user_roles from authenticated, anon;

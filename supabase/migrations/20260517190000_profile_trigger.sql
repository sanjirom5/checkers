-- Auto-create a profile row when a new auth user is created.
-- SECURITY DEFINER runs with elevated privileges, bypassing RLS.
-- username is read from the user metadata passed at signUp time.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, wins, losses, best_streak, current_streak)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    0, 0, 0, 0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Drop the client-side insert policy — profile creation now goes through the trigger only.
drop policy if exists "profiles_insert" on public.profiles;

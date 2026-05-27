-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  mascot text not null default 'bee-chef',
  weekly_budget numeric not null default 800,
  diet text not null default 'none',
  theme text not null default 'dark',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- Pantry items
create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  qty numeric not null default 1,
  unit text not null default 'pcs',
  category text not null default 'Other',
  expires_at timestamptz not null,
  price numeric,
  created_at timestamptz not null default now()
);
alter table public.pantry_items enable row level security;
create policy "own pantry all" on public.pantry_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index pantry_user_idx on public.pantry_items(user_id);

-- Expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  category text not null default 'Groceries',
  note text,
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.expenses enable row level security;
create policy "own expenses all" on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index expenses_user_idx on public.expenses(user_id);

-- Shopping items
create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.shopping_items enable row level security;
create policy "own shopping all" on public.shopping_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index shopping_user_idx on public.shopping_items(user_id);

-- Cooked meals (history)
create table public.cooked_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_id text not null,
  date timestamptz not null default now()
);
alter table public.cooked_meals enable row level security;
create policy "own cooked all" on public.cooked_meals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index cooked_user_idx on public.cooked_meals(user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Realtime
alter publication supabase_realtime add table public.pantry_items;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.shopping_items;
alter publication supabase_realtime add table public.cooked_meals;
alter publication supabase_realtime add table public.profiles;
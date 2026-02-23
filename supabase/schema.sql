-- Create users table
create table if not exists public.users (
    id uuid not null primary key,
    username text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- RLS for users
alter table public.users enable row level security;
create policy "Users can view their own data" on public.users for select using (auth.uid() = id);
create policy "All users can view all users" ON "public"."users" FOR SELECT USING (true);


-- Create posts table
create table if not exists public.posts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    content text not null check (char_length(content) <= 500),
    mood text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone not null
);
-- RLS for posts
alter table public.posts enable row level security;
create policy "Users can read all posts" on public.posts for select using (true);
create policy "Users can insert their own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.posts for delete using (auth.uid() = user_id);

-- Create comments table
create table if not exists public.comments (
    id uuid primary key default gen_random_uuid(),
    post_id uuid references public.posts(id) on delete cascade not null,
    user_id uuid not null, -- Not linking to users table to maintain anonymity even if user is deleted.
    username text not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- RLS for comments
alter table public.comments enable row level security;
create policy "Users can read all comments" on public.comments for select using (true);
create policy "Users can insert comments" on public.comments for insert with check (auth.uid() = user_id);

-- Function to handle new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, username)
  values (new.id, 'Shadow' || substr(new.id::text, 1, 4));
  return new;
end;
$$;

-- Trigger to call handle_new_user on new auth user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Cron job for auto-deletion
-- This needs to be set up in the Supabase dashboard under "Database" -> "Cron Jobs"
-- The function to call:
select cron.schedule(
    'delete-old-posts',
    '*/5 * * * *', -- Run every 5 minutes
    $$
    delete from public.posts where expires_at < now();
    $$
);

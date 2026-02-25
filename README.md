
# Ankahee - The Ephemeral Sanctuary

![Ankahee Banner](https://res.cloudinary.com/dodhvvewu/image/upload/v1771867857/9f24ff89-ae84-41e9-8d46-e1f47d467017_xoroac.png)

**“Every heart has an untold story.”**

Ankahee is a digital sanctuary designed for ephemeral, anonymous expression. It's a space to release your deepest secrets and thoughts without a trace, where every post and interaction dissolves back into the void after 24 hours. Our architecture ensures your voice is heard, then forgotten.

---

## ✨ Key Features

Ankahee is more than just a confession board; it's a suite of tools for anonymous interaction and collective expression.

-   **🤫 Anonymous by Design**: No real names, no profiles. Your identity is a transient secret.
-   **⏳ Ephemeral Content**: Confessions, comments, and chat rooms automatically disappear 24 hours after creation, ensuring your words are fleeting.
-   **👁️ Real-time Feed**: Watch the void come alive as new confessions, comments, and reactions appear instantly without refreshing the page.
-   **🔮 AI-Powered Mood Tagging**: A custom Genkit flow analyzes the sentiment of your confession and suggests a relevant mood tag (`Sad`, `Angry`, `Love`, `Anxiety`, `Secret`).
-   **📊 Interactive Polls**: Add a two-option poll to your confession to gauge community opinion.
-   **❓ Ask the Void**: Post a question and watch as the community responds with single words, forming a beautiful and insightful word cloud.
-   **🧠 Community Pulse**: The main feed features a dynamic word cloud showing the most-used words across all confessions in the last 24 hours.
-   **✉️ Unsent Letters**: A dedicated space for longer-form thoughts that never found their recipient. Letters expire after 3 days.
-   **💬 Real-time Chat Rooms**: Create or join temporary, topic-based chat rooms for live, anonymous conversations.
-   **✍️ Collaborative Story**: Each day brings a new writing prompt. Contribute one sentence at a time to build a unique story with the community.
-   **🗄️ Private Archive**: View your own expired confessions in a private archive, accessible only to you.
-   **🔥 Full Account Deletion**: Permanently delete your account and all associated content with a single click.

---

## 🚀 Tech Stack

Ankahee is built with a modern, performant, and scalable technology stack.

-   **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database & Backend**: [Supabase](https://supabase.io/) (Postgres, Auth, Realtime, Storage)
-   **Generative AI**: [Google Gemini](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Animation**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)

---

## 🛠️ Getting Started

Follow these instructions to get a local copy of Ankahee up and running.

### Prerequisites

-   Node.js (v18 or later)
-   npm, pnpm, or yarn
-   A Supabase account ([app.supabase.com](https://app.supabase.com))
-   A Google AI API Key ([makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/sourishdey2005/Ankahee.git
cd Ankahee
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1.  **Create a new Supabase project.**
2.  Navigate to the **SQL Editor** in your Supabase dashboard.
3.  Copy the entire contents of the [Database Setup](#-database-setup) script below and run it.
4.  Go to **Project Settings > API**.
5.  Find your **Project URL** and **`anon` public API key**.

### 4. Configure Environment Variables

Create a file named `.env` in the root of your project and add the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Genkit (Google AI)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Replace the placeholder values with your actual Supabase and Gemini keys.

### 5. Run the Application

You'll need two terminals for the full experience.

In the first terminal, run the Next.js development server:

```bash
npm run dev
```

In the second terminal, run the Genkit development server for the AI features:

```bash
npm run genkit:watch
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the application. The Genkit UI will be running on [http://localhost:4000](http://localhost:4000).

---

## 🗃️ Database Setup

Run this script in your Supabase SQL Editor to set up all the necessary tables and policies for Ankahee to function.

```sql
-- 1. POSTS TABLE
CREATE TABLE public.posts (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    content text NOT NULL,
    mood text,
    expires_at timestamp with time zone NOT NULL,
    parent_post_id uuid,
    is_void_question boolean NOT NULL DEFAULT false,
    CONSTRAINT posts_pkey PRIMARY KEY (id),
    CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT posts_parent_post_id_fkey FOREIGN KEY (parent_post_id) REFERENCES posts(id) ON DELETE CASCADE
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all users to view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow users to create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- 2. COMMENTS TABLE
CREATE TABLE public.comments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    username text NOT NULL,
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all users to view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow users to create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- 3. REACTIONS TABLE
CREATE TABLE public.reactions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reaction text NOT NULL,
    CONSTRAINT reactions_pkey PRIMARY KEY (id),
    CONSTRAINT reactions_post_id_user_id_key UNIQUE (post_id, user_id),
    CONSTRAINT reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all users to view reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Allow users to create/update their own reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- 4. POLLS & VOTES TABLES
CREATE TABLE public.polls (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    post_id uuid NOT NULL,
    option_one_text text NOT NULL,
    option_two_text text NOT NULL,
    CONSTRAINT polls_pkey PRIMARY KEY (id),
    CONSTRAINT polls_post_id_key UNIQUE (post_id),
    CONSTRAINT polls_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE
);
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all users to view polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Allow users to create polls" ON public.polls FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM posts WHERE posts.id = polls.post_id AND posts.user_id = auth.uid()));

CREATE TABLE public.poll_votes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    poll_id uuid NOT NULL,
    user_id uuid NOT NULL,
    selected_option integer NOT NULL,
    CONSTRAINT poll_votes_pkey PRIMARY KEY (id),
    CONSTRAINT poll_votes_poll_id_user_id_key UNIQUE (poll_id, user_id),
    CONSTRAINT poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE CASCADE,
    CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all users to view votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to vote" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. VOID ANSWERS TABLE (For "Ask the Void")
CREATE TABLE public.void_answers (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    word text NOT NULL CHECK (char_length(word) > 0 AND char_length(word) <= 30 AND word !~ '\s'),
    CONSTRAINT void_answers_pkey PRIMARY KEY (id),
    CONSTRAINT void_answers_post_id_user_id_key UNIQUE (post_id, user_id),
    CONSTRAINT void_answers_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT void_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.void_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all users to view answers" ON public.void_answers FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to submit an answer" ON public.void_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. LETTERS TABLE
CREATE TABLE public.letters (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    content text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT letters_pkey PRIMARY KEY (id),
    CONSTRAINT letters_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all users to see letters" ON public.letters FOR SELECT USING (true);
CREATE POLICY "Allow users to create letters" ON public.letters FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. ROOMS TABLES
CREATE TABLE public.rooms (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid NOT NULL,
    name text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT rooms_pkey PRIMARY KEY (id),
    CONSTRAINT rooms_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow users to create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE TABLE public.room_members (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    room_id uuid NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT room_members_pkey PRIMARY KEY (id),
    CONSTRAINT room_members_room_id_user_id_key UNIQUE (room_id, user_id),
    CONSTRAINT room_members_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
    CONSTRAINT room_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to see members" ON public.room_members FOR SELECT USING (true);
CREATE POLICY "Allow users to join/leave rooms" ON public.room_members FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.room_messages (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    room_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    CONSTRAINT room_messages_pkey PRIMARY KEY (id),
    CONSTRAINT room_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
    CONSTRAINT room_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow members to see messages" ON public.room_messages FOR SELECT USING (EXISTS (SELECT 1 FROM room_members WHERE room_members.room_id = room_messages.room_id AND room_members.user_id = auth.uid()));
CREATE POLICY "Allow members to send messages" ON public.room_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM room_members WHERE room_members.room_id = room_messages.room_id AND room_members.user_id = auth.uid()));


-- 8. STORY TABLE
CREATE TABLE public.story_segments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    story_id text NOT NULL,
    "order" integer NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    CONSTRAINT story_segments_pkey PRIMARY KEY (id),
    CONSTRAINT story_segments_story_id_order_key UNIQUE (story_id, "order"),
    CONSTRAINT story_segments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.story_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to view story" ON public.story_segments FOR SELECT USING (true);
CREATE POLICY "Allow users to add to story" ON public.story_segments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. USER PUBLIC DATA
-- Create a public table for user data
create table public.users (
  id uuid not null references auth.users on delete cascade,
  username text,
  primary key (id)
);
alter table public.users enable row level security;
-- This trigger automatically creates a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username)
  values (new.id, 'Anonymous');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

```

---

## 📞 Contact

Created by [Sourish Dey](https://github.com/sourishdey2005) as part of a Firebase Studio project.

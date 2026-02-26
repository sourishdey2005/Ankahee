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
-   **✉️ Ephemeral Direct Messaging**: Start a private, 1-on-1 chat with another user directly from a comment they've made. These conversations expire 1 hour after creation.
-   **✍️ Collaborative Story**: Each day brings a new writing prompt. Contribute one sentence at a time to build a unique story with the community.
-   **🔖 Ephemeral Bookmarks**: Save a confession to a private list. Bookmarks are automatically removed when the post expires.
-   **🗄️ Private Archive**: View your own expired confessions in a private archive, accessible only to you.
-   **🔥 Full Account Deletion**: Permanently delete your account and all associated content with a single click.

---

## 🚀 Tech Stack

Ankahee is built with a modern, performant, and scalable technology stack.

-   **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database & Backend**: [Supabase](https://supabase.io/) (Postgres, Auth, Realtime, Storage)
-   **Generative AI**: [Google Gemini](https://deepmind.google.com/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
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


### 1. Clone the Repository

```bash
git clone https://github.com/sourishdey2005/Ankahee.git
cd Ankahee
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

You will need to create a `.env` file in the root of the project and add your Supabase project URL and anon key.

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4. Run the Application

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

## 📞 Contact

Created by [Sourish Dey](https://github.com/sourishdey2005).

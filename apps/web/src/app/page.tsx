import { APP_NAME } from "@moves/shared";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-12 bg-zinc-50 dark:bg-black">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {APP_NAME}
      </h1>
      <p className="max-w-md text-center text-zinc-600 dark:text-zinc-400">
        Vibe-based discovery for places, events, and activities.
      </p>
    </main>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { APP_NAME, DEFAULT_CITY } from "@moves/shared";
import { SearchBar } from "@/components/SearchBar";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 p-12 dark:bg-black">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {APP_NAME}
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          Vibe-based discovery in {DEFAULT_CITY}. Describe the night you want.
        </p>
      </div>

      <Suspense>
        <SearchBar />
      </Suspense>

      <Link
        href="/search"
        className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        Or browse everything →
      </Link>
    </main>
  );
}

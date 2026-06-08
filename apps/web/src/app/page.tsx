import {
  APP_NAME,
  DEFAULT_CITY,
  VIBES,
  MUSIC_STYLES,
  type Vibe,
} from "@moves/shared";

// Compile-time proof that the union type narrows correctly. If you change
// VIBES, this line either stays valid or becomes a type error — exactly
// what we want.
const SAMPLE_VIBE: Vibe = "energetic";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-12 bg-zinc-50 dark:bg-black">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {APP_NAME}
      </h1>
      <p className="max-w-md text-center text-zinc-600 dark:text-zinc-400">
        Vibe-based discovery in {DEFAULT_CITY}. Featured vibe:{" "}
        <span className="font-medium">{SAMPLE_VIBE}</span>.
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
        {VIBES.map((v) => (
          <span
            key={v}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            {v}
          </span>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        {MUSIC_STYLES.length} music styles · {VIBES.length} vibes seeded
      </p>
    </main>
  );
}

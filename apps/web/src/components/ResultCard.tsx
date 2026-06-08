import type { ScoredResult } from "@moves/shared";
import { TagPill } from "./TagPill";

type ResultCardProps = {
  result: ScoredResult;
};

export function ResultCard({ result }: ResultCardProps) {
  // Events get their own card in a later step. For now, only places render.
  if (result.itemType !== "place") return null;

  const place = result.item;
  const prettyCategory = place.category.replace(/-/g, " ");

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            {place.name}
          </h3>
          <p className="text-xs text-zinc-500">
            {place.neighborhood} · {"$".repeat(place.priceLevel)}
          </p>
        </div>
        <span className="text-xs uppercase tracking-wide text-zinc-400">
          {prettyCategory}
        </span>
      </div>

      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        {place.description}
      </p>

      {(place.vibes.length > 0 || place.musicStyles.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {place.vibes.map((v) => (
            <TagPill key={`vibe-${v}`}>{v}</TagPill>
          ))}
          {place.musicStyles.map((m) => (
            <TagPill key={`music-${m}`} variant="muted">
              {m}
            </TagPill>
          ))}
        </div>
      )}
    </article>
  );
}

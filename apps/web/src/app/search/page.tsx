import Link from "next/link";
import { Suspense } from "react";
import { APP_NAME } from "@moves/shared";
import { ResultCard } from "@/components/ResultCard";
import { SearchBar } from "@/components/SearchBar";
import {
  parseSearchQuery,
  searchParamsToURLSearchParams,
} from "@/lib/search/parseSearchQuery";
import { searchPlaces } from "@/lib/search/searchPlaces";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const raw = await searchParams;
  const params = searchParamsToURLSearchParams(raw);
  const query = parseSearchQuery(params);
  const response = await searchPlaces(query);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-200"
        >
          ← {APP_NAME}
        </Link>
      </header>

      <Suspense>
        <SearchBar defaultValue={query.q} />
      </Suspense>

      <p className="text-xs text-zinc-500">
        {response.totalCount}{" "}
        {response.totalCount === 1 ? "result" : "results"}
        {response.totalCount > response.results.length &&
          ` (showing first ${response.results.length})`}
      </p>

      {response.results.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
          Nothing matched. Try a broader query or remove a filter.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {response.results.map((r) => (
            <ResultCard key={`${r.itemType}-${r.item.id}`} result={r} />
          ))}
        </div>
      )}
    </main>
  );
}

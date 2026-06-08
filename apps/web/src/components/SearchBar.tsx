"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

type SearchBarProps = {
  defaultValue?: string;
};

/**
 * Client component. Owns its own input state and writes `?q=...` to the
 * URL on submit — keeping search state in the URL means refresh/share/back
 * all "just work" without us storing anything in React state at the page level.
 */
export function SearchBar({ defaultValue }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue ?? "");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
    if (trimmed === "") {
      next.delete("q");
    } else {
      next.set("q", trimmed);
    }
    const qs = next.toString();
    router.push(qs === "" ? "/search" : `/search?${qs}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-2xl gap-2">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Describe the night you want..."
        className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <button
        type="submit"
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Search
      </button>
    </form>
  );
}

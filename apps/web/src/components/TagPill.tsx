import type { ReactNode } from "react";

type TagPillProps = {
  children: ReactNode;
  variant?: "default" | "muted";
};

export function TagPill({ children, variant = "default" }: TagPillProps) {
  const variantClasses =
    variant === "muted"
      ? "border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-500"
      : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${variantClasses}`}
    >
      {children}
    </span>
  );
}

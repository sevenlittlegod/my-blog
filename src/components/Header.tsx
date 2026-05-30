"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-stone-950 dark:text-white">
          林葛由
        </Link>

        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link
            href="/"
            className="text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-white"
          >
            首页
          </Link>
          <Link
            href="/tags"
            className="text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-white"
          >
            标签
          </Link>
          <Link
            href="/about"
            className="text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-white"
          >
            关于
          </Link>
          <Link
            href="/search"
            className="rounded-md p-1.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-950 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white"
            aria-label="搜索"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="rounded-md p-1.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-950 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white"
            aria-label="切换深色模式"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36-.7-.7M6.34 6.34l-.7-.7m12.72 0-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
              />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 dark:border-stone-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-stone-500 dark:text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>&copy; {new Date().getFullYear()} 林葛由。保留所有权利。</span>
        <div className="flex gap-4">
          <Link href="/rss.xml" className="transition-colors hover:text-stone-700 dark:hover:text-stone-300">
            RSS
          </Link>
          <Link href="/admin" className="transition-colors hover:text-stone-700 dark:hover:text-stone-300">
            后台
          </Link>
        </div>
      </div>
    </footer>
  );
}

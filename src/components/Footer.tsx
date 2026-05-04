import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-6 text-sm text-gray-500 dark:text-gray-500">
        <span>&copy; {new Date().getFullYear()} My Blog. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/rss.xml" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            RSS
          </Link>
          <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

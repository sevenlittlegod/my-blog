"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  createdAt: string;
  author: { name: string };
  tags: { id: string; name: string; slug: string }[];
}

export function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    router.replace(`/search?q=${encodeURIComponent(q)}`);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      setResults((await res.json()).posts);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, [initialQ, doSearch]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Search</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          doSearch(query);
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search posts..."
        />
        <button
          type="submit"
          className="rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-gray-500 text-sm">Searching...</p>}

      {searched && !loading && results.length === 0 && (
        <p className="text-gray-500">No results found.</p>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-4">
          {results.map((post) => (
            <article
              key={post.id}
              className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
            >
              <Link
                href={`/posts/${post.slug}`}
                className="text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400"
              >
                {post.title}
              </Link>
              {post.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="text-xs rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

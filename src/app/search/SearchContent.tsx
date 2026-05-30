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
    if (!initialQ) return;

    const timer = window.setTimeout(() => {
      void doSearch(initialQ);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialQ, doSearch]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">搜索</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          输入关键词，查找文章标题、摘要和正文内容。
        </p>
      </div>

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
          className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
          placeholder="搜索文章..."
        />
        <button
          type="submit"
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          搜索
        </button>
      </form>

      {loading && <p className="text-stone-500 text-sm">搜索中...</p>}

      {searched && !loading && results.length === 0 && (
        <p className="text-stone-500">没有找到结果。</p>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-4">
          {results.map((post) => (
            <article
              key={post.id}
              className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950"
            >
              <Link
                href={`/posts/${post.slug}`}
                className="text-lg font-semibold hover:text-teal-700 dark:hover:text-teal-300"
              >
                {post.title}
              </Link>
              {post.excerpt && (
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300"
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

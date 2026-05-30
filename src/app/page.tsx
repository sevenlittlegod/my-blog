import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, tags] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: {
        author: { select: { name: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: { where: { approved: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: { where: { post: { published: true } } } },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const activeTags = tags
    .map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.posts }))
    .filter((t) => t.count > 0);

  const formattedPosts = posts.map((p) => ({
    ...p,
    tags: p.tags.map((pt) => pt.tag),
    commentCount: p._count.comments,
  }));

  return (
    <div className="flex flex-col gap-12">
      <section className="grid gap-8 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-end">
        <div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            记录技术、编程，以及把想法慢慢做成现实的过程。
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600 dark:text-stone-400">
            这里是林葛由的个人博客，写下开发实践、工具体验和生活里的观察。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              搜索文章
            </Link>
            <Link
              href="/tags"
              className="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
            >
              浏览标签
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900/40">
          <p className="text-sm font-medium text-stone-950 dark:text-stone-100">
            当前状态
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-2xl font-semibold">{formattedPosts.length}</p>
              <p className="text-stone-500">最新文章</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{activeTags.length}</p>
              <p className="text-stone-500">活跃标签</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">最新文章</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              最近发布的笔记和思考。
            </p>
          </div>
        </div>
        {formattedPosts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center text-stone-500 dark:border-stone-700 dark:bg-stone-900/30">
            <p className="text-lg font-medium text-stone-700 dark:text-stone-300">
              暂无文章
            </p>
            <p className="mt-2 text-sm">
              <Link href="/admin" className="text-teal-700 hover:underline dark:text-teal-300">
                写第一篇文章
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {formattedPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        )}
      </section>

      {activeTags.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">标签</h2>
          <div className="flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="rounded-full border border-stone-200 px-4 py-1.5 text-sm transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800"
              >
                {tag.name}
                <span className="ml-1.5 text-stone-400">{tag.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

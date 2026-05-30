import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [postCount, commentCount, pageViews, recentPosts, recentComments] =
    await Promise.all([
      prisma.post.count(),
      prisma.comment.count(),
      prisma.pageView.count(),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      }),
      prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { post: { select: { title: true, slug: true } } },
      }),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">后台概览</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          管理文章、评论与访问数据，让林葛由保持稳定更新。
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
          <p className="text-sm text-stone-500 dark:text-stone-400">文章总数</p>
          <p className="mt-2 text-3xl font-semibold">{postCount}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
          <p className="text-sm text-stone-500 dark:text-stone-400">评论</p>
          <p className="mt-2 text-3xl font-semibold">{commentCount}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
          <p className="text-sm text-stone-500 dark:text-stone-400">访问量</p>
          <p className="mt-2 text-3xl font-semibold">{pageViews}</p>
        </div>
      </div>

      {/* Recent Posts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">近期文章</h2>
          <Link
            href="/admin/posts/new"
            className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            写文章
          </Link>
        </div>
        <div className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-950">
          {recentPosts.length === 0 ? (
            <p className="p-4 text-sm text-stone-500">还没有文章。</p>
          ) : (
            recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-sm font-medium hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-stone-500 mt-1">
                    {post.published ? "已发布" : "草稿"} ·{" "}
                    {post.createdAt.toLocaleDateString("zh-CN")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Comments */}
      <section>
        <h2 className="text-lg font-semibold mb-3">近期评论</h2>
        <div className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-950">
          {recentComments.length === 0 ? (
            <p className="p-4 text-sm text-stone-500">还没有评论。</p>
          ) : (
            recentComments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{comment.authorName}</p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      comment.approved
                        ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {comment.approved ? "已通过" : "待审核"}
                  </span>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 line-clamp-1">
                  {comment.content}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  来自{" "}
                  <Link
                    href={`/posts/${comment.post.slug}`}
                    className="hover:underline"
                  >
                    {comment.post.title}
                  </Link>
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

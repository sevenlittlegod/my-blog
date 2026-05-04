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
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">Total Posts</p>
          <p className="text-2xl font-bold">{postCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">Comments</p>
          <p className="text-2xl font-bold">{commentCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">Page Views</p>
          <p className="text-2xl font-bold">{pageViews}</p>
        </div>
      </div>

      {/* Recent Posts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Posts</h2>
          <Link
            href="/admin/posts/new"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            New Post
          </Link>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
          {recentPosts.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No posts yet.</p>
          ) : (
            recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3"
              >
                <div>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {post.published ? "Published" : "Draft"} &middot;{" "}
                    {post.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Comments */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Comments</h2>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
          {recentComments.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No comments yet.</p>
          ) : (
            recentComments.map((comment) => (
              <div key={comment.id} className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{comment.authorName}</p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      comment.approved
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}
                  >
                    {comment.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {comment.content}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  on{" "}
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

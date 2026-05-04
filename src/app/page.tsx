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
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to My Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Thoughts on technology, programming, and building things on the web.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Recent Posts</h2>
        {formattedPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <p className="text-lg">No posts yet.</p>
            <p className="text-sm mt-1">
              <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline">
                Write your first post
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
          <h2 className="text-2xl font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="rounded-full border border-gray-200 dark:border-gray-800 px-4 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {tag.name}
                <span className="ml-1.5 text-gray-400">{tag.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tags" };

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { posts: { where: { post: { published: true } } } } },
    },
    orderBy: { name: "asc" },
  });

  const tagsWithCount = tags
    .map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      postCount: t._count.posts,
    }))
    .filter((t) => t.postCount > 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Tags</h1>
      {tagsWithCount.length === 0 ? (
        <p className="text-gray-500">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tagsWithCount.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full border border-gray-200 dark:border-gray-800 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {tag.name}
              <span className="ml-1.5 text-gray-400">{tag.postCount}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

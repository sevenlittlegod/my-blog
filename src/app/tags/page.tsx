import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "标签" };

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
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">标签</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          按主题浏览林葛由的文章。
        </p>
      </div>
      {tagsWithCount.length === 0 ? (
        <p className="text-stone-500">暂无标签。</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tagsWithCount.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full border border-stone-200 px-4 py-2 text-sm transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800"
            >
              {tag.name}
              <span className="ml-1.5 text-stone-400">{tag.postCount}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

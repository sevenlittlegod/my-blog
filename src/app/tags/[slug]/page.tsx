import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return { title: "Not Found" };
  return { title: `标签：${tag.name}` };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { post: { published: true } },
        include: {
          post: {
            include: {
              author: { select: { name: true } },
              tags: { include: { tag: true } },
              _count: { select: { comments: { where: { approved: true } } } },
            },
          },
        },
        orderBy: { post: { createdAt: "desc" } },
      },
    },
  });

  if (!tag) notFound();

  const posts = tag.posts.map((pt) => ({
    ...pt.post,
    tags: pt.post.tags.map((t) => t.tag),
    commentCount: pt.post._count.comments,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        标签：{tag.name}
      </h1>
      {posts.length === 0 ? (
        <p className="text-stone-500">这个标签下还没有文章。</p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </div>
  );
}

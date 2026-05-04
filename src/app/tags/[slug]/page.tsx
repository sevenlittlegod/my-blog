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
  return { title: `Posts tagged "${tag.name}"` };
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
      <h1 className="text-2xl font-bold">
        Posts tagged &ldquo;{tag.name}&rdquo;
      </h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts with this tag.</p>
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

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewPostForm } from "../../NewPostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  const formattedPost = {
    ...post,
    tags: post.tags.map((pt) => pt.tag),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">编辑文章</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          更新内容、标签和发布状态。
        </p>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <NewPostForm post={formattedPost} />
      </div>
    </div>
  );
}

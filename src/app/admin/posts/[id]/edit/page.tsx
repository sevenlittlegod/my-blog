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
      <h1 className="text-2xl font-bold">Edit Post</h1>
      <NewPostForm post={formattedPost} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { AdminCommentList } from "./AdminCommentList";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { title: true, slug: true } },
      parent: { select: { id: true, content: true, authorName: true } },
      replies: { select: { id: true, content: true, authorName: true, approved: true, createdAt: true } },
    },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Comments</h1>
      <AdminCommentList initialComments={JSON.parse(JSON.stringify(comments))} />
    </div>
  );
}

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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">评论审核</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          查看访客留言，处理待审核评论和回复。
        </p>
      </div>
      <AdminCommentList initialComments={JSON.parse(JSON.stringify(comments))} />
    </div>
  );
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const GET = auth(async (request) => {
  if (!request.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = new Date();
  date.setDate(date.getDate() - 30);

  const [total, recent, topPosts] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({
      where: { createdAt: { gte: date } },
    }),
    prisma.pageView.groupBy({
      by: ["postId"],
      _count: true,
      orderBy: { _count: { postId: "desc" } },
      take: 10,
    }),
  ]);

  // Get post titles for top posts
  const postIds = topPosts
    .map((p) => p.postId)
    .filter((id): id is string => id !== null);

  const posts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    select: { id: true, title: true, slug: true },
  });

  const postMap = new Map(posts.map((p) => [p.id, p]));

  const topPostData = topPosts
    .filter((p) => p.postId && postMap.has(p.postId))
    .map((p) => ({
      ...postMap.get(p.postId!)!,
      views: p._count,
    }));

  return NextResponse.json({
    total,
    recent30Days: recent,
    topPosts: topPostData,
  });
});

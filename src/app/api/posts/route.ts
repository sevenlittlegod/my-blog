import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
  const tag = searchParams.get("tag");
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const published =
    isAdmin && searchParams.get("published") === "false" ? false : true;

  const where = {
    published,
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { name: true, email: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      published: p.published,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      author: p.author,
      tags: p.tags.map((pt) => pt.tag),
      commentCount: p._count.comments,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export const POST = auth(async (request) => {
  const userId =
    request.auth?.user?.role === "ADMIN" ? request.auth.user.id : undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, slug, content, excerpt, coverImage, published, tagIds } = body;

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: "标题、链接别名和正文不能为空" },
      { status: 400 }
    );
  }

  const post = await prisma.post
    .create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || "",
        coverImage: coverImage || "",
        published: published ?? false,
        authorId: userId,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
      include: {
        author: { select: { name: true, email: true } },
        tags: { include: { tag: true } },
      },
    })
    .catch(() => null);

  if (!post) {
    return NextResponse.json(
      { error: "保存失败，可能是链接别名已经存在" },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ...post,
    tags: post.tags.map((pt) => pt.tag),
  }, { status: 201 });
});

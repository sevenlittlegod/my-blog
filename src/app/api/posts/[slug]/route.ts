import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, email: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: { where: { approved: true } } } },
    },
  });

  if (!post || (!post.published && !(await isAdmin()))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...post,
    tags: post.tags.map((pt) => pt.tag),
    commentCount: post._count.comments,
  });
}

export const PUT = auth(async (request, { params }) => {
  if (!request.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await (params as Promise<{ slug: string }>);
  const body = await request.json();
  const { title, content, excerpt, coverImage, published, tagIds, newSlug } = body;

  const existing = await prisma.post.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Disconnect all existing tags if updating tags
  if (tagIds !== undefined) {
    await prisma.postTag.deleteMany({ where: { postId: existing.id } });
  }

  const post = await prisma.post.update({
    where: { id: existing.id },
    data: {
      title: title ?? existing.title,
      slug: newSlug ?? slug,
      content: content ?? existing.content,
      excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
      coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
      published: published !== undefined ? published : existing.published,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
    include: {
      author: { select: { name: true, email: true } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json({
    ...post,
    tags: post.tags.map((pt) => pt.tag),
  });
});

export const DELETE = auth(async (request, { params }) => {
  if (!request.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await (params as Promise<{ slug: string }>);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
});

async function isAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return role === "ADMIN";
}

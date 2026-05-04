import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
  }

  // For public view, only show approved comments (or all if admin)
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      ...(isAdmin ? {} : { approved: true }),
      parentId: null, // Top-level only; replies included
    },
    include: {
      replies: {
        where: isAdmin ? {} : { approved: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, authorName, authorEmail, postId, parentId } = body;

  if (!content?.trim() || !authorName?.trim() || !postId) {
    return NextResponse.json(
      { error: "Content, authorName, and postId are required" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      authorName: authorName.trim(),
      authorEmail: authorEmail?.trim() || "",
      postId,
      parentId: parentId || null,
      approved: false,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}

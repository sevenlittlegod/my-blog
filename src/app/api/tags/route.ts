import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const showAll = request.nextUrl.searchParams.get("all") === "true";

  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: { where: { post: { published: true } } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = tags.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    postCount: t._count.posts,
  }));

  return NextResponse.json(showAll ? result : result.filter((t) => t.postCount > 0));
}

export const POST = auth(async (request) => {
  if (!request.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Tag name required" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const tag = await prisma.tag.upsert({
    where: { slug },
    update: {},
    create: { name: name.trim(), slug },
  });

  return NextResponse.json(tag, { status: 201 });
});

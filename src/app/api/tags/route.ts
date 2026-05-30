import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/slug";

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
  if (request.auth?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "标签名称不能为空" }, { status: 400 });
  }

  const slug = slugify(name, "tag");

  const tag = await prisma.tag.upsert({
    where: { slug },
    update: {},
    create: { name: name.trim(), slug },
  });

  return NextResponse.json(tag, { status: 201 });
});

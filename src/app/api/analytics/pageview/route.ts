import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { path, postId, referrer, userAgent } = body;

  await prisma.pageView.create({
    data: {
      path: path || "/",
      referrer: referrer || request.headers.get("referer") || "",
      userAgent: userAgent || request.headers.get("user-agent") || "",
      postId: postId || null,
    },
  });

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const PUT = auth(async (request, { params }) => {
  if (!request.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await (params as Promise<{ id: string }>);
  const comment = await prisma.comment.update({
    where: { id },
    data: { approved: true },
  });

  return NextResponse.json(comment);
});

export const DELETE = auth(async (request, { params }) => {
  if (!request.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await (params as Promise<{ id: string }>);
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ success: true });
});

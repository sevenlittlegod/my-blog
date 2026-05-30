import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentSection } from "@/components/CommentSection";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    select: { title: true, excerpt: true, coverImage: true },
  });
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { name: true, email: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  const tags = post.tags.map((pt) => pt.tag);
  const date = new Date(post.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4">
        {post.coverImage && (
          <div className="relative h-64 w-full overflow-hidden rounded-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              unoptimized
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full bg-teal-50 px-3 py-0.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300"
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-500">
          <span>{post.author.name}</span>
          <span>{date}</span>
        </div>
      </header>

      {/* Content */}
      <MarkdownRenderer content={post.content} />

      {/* Comments */}
      <hr className="border-stone-200 dark:border-stone-800" />
      <CommentSection postId={post.id} />
    </article>
  );
}

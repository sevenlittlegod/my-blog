import { notFound } from "next/navigation";
import Link from "next/link";
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
  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 object-cover rounded-xl"
          />
        )}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
          <span>{post.author.name}</span>
          <span>{date}</span>
        </div>
      </header>

      {/* Content */}
      <MarkdownRenderer content={post.content} />

      {/* Comments */}
      <hr className="border-gray-200 dark:border-gray-800" />
      <CommentSection postId={post.id} />
    </article>
  );
}

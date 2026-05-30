import Link from "next/link";
import Image from "next/image";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  createdAt: string | Date;
  author: { name: string | null };
  tags: Tag[];
  commentCount?: number;
}

export function PostCard({ title, slug, excerpt, coverImage, createdAt, author, tags, commentCount }: PostCardProps) {
  const date = new Date(createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition-colors hover:border-stone-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-stone-700">
      {coverImage && (
        <Link href={`/posts/${slug}`}>
          <div className="relative h-48 w-full">
            <Image
              src={coverImage}
              alt={title}
              fill
              unoptimized
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Link>
      )}
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50"
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <Link href={`/posts/${slug}`}>
          <h3 className="text-xl font-semibold transition-colors hover:text-teal-700 dark:hover:text-teal-300">
            {title}
          </h3>
        </Link>
        {excerpt && (
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400 line-clamp-2">
            {excerpt}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-500">
          <span>{author.name}</span>
          <span>{date}</span>
          {commentCount !== undefined && (
            <span>{commentCount} 条评论</span>
          )}
        </div>
      </div>
    </article>
  );
}

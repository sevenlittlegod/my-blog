import Link from "next/link";

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
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      {coverImage && (
        <Link href={`/posts/${slug}`}>
          <img
            src={coverImage}
            alt={title}
            className="w-full h-48 object-cover"
          />
        </Link>
      )}
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <Link href={`/posts/${slug}`}>
          <h3 className="text-xl font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {title}
          </h3>
        </Link>
        {excerpt && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {excerpt}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
          <span>{author.name}</span>
          <span>{date}</span>
          {commentCount !== undefined && (
            <span>{commentCount} comment{commentCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
    </article>
  );
}

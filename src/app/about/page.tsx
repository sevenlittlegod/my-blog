export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">About</h1>
      <div className="prose dark:prose-invert">
        <p>
          Welcome to my blog! I write about technology, programming, and
          building things on the web.
        </p>
        <p>
          This blog is built with Next.js, Prisma, PostgreSQL, and Tailwind CSS.
          It features a custom admin dashboard, markdown content management,
          comments, and more.
        </p>
        <p>
          Feel free to explore my posts, leave comments, and reach out if you
          have questions or ideas to share.
        </p>
      </div>
    </div>
  );
}

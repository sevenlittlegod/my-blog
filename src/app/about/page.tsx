export const metadata = { title: "关于" };

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">关于林葛由</h1>
      <div className="prose dark:prose-invert">
        <p>
          这里是林葛由的个人博客。我会记录技术实践、编程经验，以及把想法落地时遇到的细节。
        </p>
        <p>
          这个站点基于 Next.js、Prisma、PostgreSQL 和 Tailwind CSS 构建，支持
          Markdown 写作、标签、搜索、评论审核和后台管理。
        </p>
        <p>
          欢迎浏览文章，也欢迎在评论里留下问题、建议或新的想法。
        </p>
      </div>
    </div>
  );
}

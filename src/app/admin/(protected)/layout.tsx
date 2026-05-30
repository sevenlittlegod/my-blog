import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const sidebarLinks = [
  { href: "/admin", label: "概览" },
  { href: "/admin/posts/new", label: "写文章" },
  { href: "/admin/comments", label: "评论审核" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:min-h-[calc(100vh-9rem)]">
        <nav className="sticky top-20 rounded-lg border border-stone-200 bg-stone-950 p-2 text-sm shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="px-3 py-3">
            <p className="text-xs text-stone-400">后台管理</p>
            <p className="mt-1 font-semibold text-white">林葛由</p>
          </div>
          <div className="mt-1 flex flex-col gap-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="my-2 border-t border-white/10" />
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            查看网站
          </Link>
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts/new", label: "New Post" },
  { href: "/admin/comments", label: "Comments" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex gap-8">
      <aside className="w-48 shrink-0">
        <nav className="sticky top-20 flex flex-col gap-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-2 border-gray-200 dark:border-gray-800" />
          <a
            href="/"
            className="rounded-md px-3 py-2 text-sm text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            View Site
          </a>
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

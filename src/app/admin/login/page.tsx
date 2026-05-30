"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const requestedCallback = new URLSearchParams(window.location.search).get(
      "callbackUrl"
    );
    const callbackUrl = requestedCallback?.startsWith("/")
      ? requestedCallback
      : "/admin";
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("邮箱或密码不正确");
      setLoading(false);
    } else {
      router.push(result?.url || callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="mx-auto flex min-h-[68vh] w-full max-w-5xl items-center justify-center py-8">
      <div className="grid w-full overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950 md:grid-cols-[1fr_420px]">
        <section className="hidden bg-stone-950 p-8 text-white md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-sm text-teal-300">林葛由</p>
            <h1 className="mt-4 max-w-sm text-3xl font-semibold leading-tight">
              回到后台，继续把想法整理成文章。
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-stone-400">
            这里负责文章发布、评论审核和访问统计。登录后即可进入管理面板。
          </p>
        </section>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 sm:p-8">
          <div className="mb-2">
            <h1 className="text-2xl font-semibold tracking-tight">后台登录</h1>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              使用管理员邮箱和密码登录。
            </p>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
              placeholder="请输入密码"
            />
          </div>
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}

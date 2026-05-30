import { NewPostForm } from "../NewPostForm";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">写文章</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          用 Markdown 记录新的想法，保存草稿或直接发布。
        </p>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <NewPostForm />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import { slugify } from "@/lib/slug";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface PostFormPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  published: boolean;
  tags?: Tag[];
}

export function NewPostForm({ post }: { post?: PostFormPost }) {
  const router = useRouter();
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [published, setPublished] = useState(post?.published || false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags?.map((t: Tag) => t.id) || []
  );
  const [newTagName, setNewTagName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tags?all=true")
      .then((r) => r.json())
      .then(setAllTags);
  }, []);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const previousSlug = title.trim() ? slugify(title) : "";
    if (!isEditing || slug === previousSlug) {
      setSlug(newTitle.trim() ? slugify(newTitle) : "");
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function createTag() {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const newTag = await res.json();
        setAllTags((prev) =>
          [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name))
        );
        setSelectedTags((prev) => [...prev, newTag.id]);
        setNewTagName("");
      }
    } catch {
      setError("标签创建失败，请稍后再试");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("标题、链接别名和正文不能为空");
      setSaving(false);
      return;
    }

    const body = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim(),
      coverImage: coverImage.trim(),
      published,
      tagIds: selectedTags,
    };

    try {
      const url = isEditing ? `/api/posts/${post.slug}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { ...body, newSlug: slug.trim() } : body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "保存失败，请稍后再试");
        setSaving(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("发生错误，请稍后再试");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">标题</label>
        <input
          value={title}
          onChange={handleTitleChange}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
          placeholder="输入文章标题"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1">链接别名</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
          placeholder="article-slug"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium mb-1">摘要</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
          placeholder="用于列表和分享的简短说明"
        />
      </div>

      {/* Cover Image URL */}
      <div>
        <label className="block text-sm font-medium mb-1">封面图地址</label>
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1">标签</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {allTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                selectedTags.includes(tag.id)
                  ? "bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
                  : "bg-white dark:bg-stone-950 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-400"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
            placeholder="新标签名称"
          />
          <button
            type="button"
            onClick={createTag}
            className="rounded-md bg-stone-100 px-3 py-1.5 text-sm transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            添加
          </button>
        </div>
      </div>

      {/* Content - Markdown Editor */}
      <div>
        <label className="block text-sm font-medium mb-1">正文</label>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || "")}
          height={400}
          preview="edit"
        />
      </div>

      {/* Publish Toggle */}
      <div className="flex flex-col gap-4 border-t border-stone-200 pt-4 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded border-stone-300 dark:border-stone-700"
          />
          <span className="text-sm font-medium">
            {published ? "已发布" : "保存为草稿"}
          </span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm transition-colors hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : isEditing ? "更新文章" : "创建文章"}
          </button>
        </div>
      </div>
    </form>
  );
}

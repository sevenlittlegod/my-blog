"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  approved: boolean;
  createdAt: string;
  replies: Comment[];
}

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyName, setReplyName] = useState("");
  const [message, setMessage] = useState("");

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/comments?postId=${postId}`);
    setComments(await res.json());
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchComments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        authorName: name,
        authorEmail: email,
        postId,
      }),
    });

    if (res.ok) {
      setContent("");
      setName("");
      setEmail("");
      setMessage("评论已提交，等待审核。");
      fetchComments();
    } else {
      setMessage("提交失败，请稍后再试。");
    }
    setSubmitting(false);
  }

  async function handleReply(commentId: string) {
    if (!replyContent.trim() || !replyName.trim()) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: replyContent,
        authorName: replyName,
        postId,
        parentId: commentId,
      }),
    });

    if (res.ok) {
      setReplyTo(null);
      setReplyContent("");
      setReplyName("");
      fetchComments();
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">
        评论（{comments.length}）
      </h2>

      {/* Comment List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-stone-500">正在加载评论...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-stone-500">暂无评论，欢迎留下第一条。</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-3">
              <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{comment.authorName}</span>
                  <span className="text-xs text-stone-500">
                    {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-700 dark:text-stone-300">
                  {comment.content}
                </p>
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="mt-2 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  {replyTo === comment.id ? "取消" : "回复"}
                </button>

                {replyTo === comment.id && (
                  <div className="mt-3 flex flex-col gap-2 border-l-2 border-stone-200 pl-4 dark:border-stone-700">
                    <input
                      value={replyName}
                      onChange={(e) => setReplyName(e.target.value)}
                      className="rounded-md border border-stone-300 bg-white px-2 py-1 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-stone-700 dark:bg-stone-950"
                      placeholder="你的名字"
                    />
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      className="rounded-md border border-stone-300 bg-white px-2 py-1 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-stone-700 dark:bg-stone-950"
                      placeholder="写下回复..."
                    />
                    <button
                      onClick={() => handleReply(comment.id)}
                      className="self-end rounded-md bg-teal-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-teal-700"
                    >
                      回复
                    </button>
                  </div>
                )}

                {/* Nested Replies */}
                {comment.replies?.length > 0 && (
                  <div className="mt-3 flex flex-col gap-3 border-l-2 border-stone-200 pl-6 dark:border-stone-700">
                    {comment.replies.map((reply) => (
                      <div key={reply.id}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{reply.authorName}</span>
                          <span className="text-xs text-stone-500">
                            {new Date(reply.createdAt).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-stone-200 pt-6 dark:border-stone-800">
        <h3 className="text-lg font-semibold">留下评论</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
            placeholder="你的名字 *"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
            placeholder="邮箱（可选）"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-teal-900/40"
          placeholder="写下评论... *"
        />
        {message && (
          <p className="text-sm text-stone-500">{message}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="self-end rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          {submitting ? "提交中..." : "提交评论"}
        </button>
      </form>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  approved: boolean;
  createdAt: string;
  post: { title: string; slug: string };
  parent?: { id: string; content: string; authorName: string } | null;
  replies?: { id: string; content: string; authorName: string; approved: boolean; createdAt: string }[];
}

export function AdminCommentList({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  async function toggleApprove(comment: Comment) {
    if (comment.approved) return;

    const res = await fetch(`/api/comments/${comment.id}/approve`, {
      method: "PUT",
    });
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, approved: true } : c))
      );
    }
  }

  async function deleteComment(id: string) {
    const res = await fetch(`/api/comments/${id}/approve`, {
      method: "DELETE",
    });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  }

  if (comments.length === 0) {
    return <p className="text-sm text-stone-500">还没有评论。</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.authorName}</span>
                {comment.authorEmail && (
                  <span className="text-xs text-stone-500">{comment.authorEmail}</span>
                )}
              </div>
              <p className="text-sm text-stone-700 dark:text-stone-300 mt-1">
                {comment.content}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                来自{" "}
                <Link
                  href={`/posts/${comment.post.slug}`}
                  className="text-teal-700 hover:underline dark:text-teal-300"
                >
                  {comment.post.title}
                </Link>
                {" "}· {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
              </p>
              {comment.parent && (
                <p className="text-xs text-stone-400 mt-1">
                  回复 {comment.parent.authorName}：{comment.parent.content.slice(0, 80)}...
                </p>
              )}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 border-l-2 border-stone-200 pl-3 dark:border-stone-700">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      <span className="font-medium">{reply.authorName}</span>: {reply.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  comment.approved
                    ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                }`}
              >
                {comment.approved ? "已通过" : "待审核"}
              </span>
              {!comment.approved && (
                <button
                  onClick={() => toggleApprove(comment)}
                  className="text-xs text-teal-700 hover:underline dark:text-teal-300"
                >
                  通过
                </button>
              )}
              <button
                onClick={() => deleteComment(comment.id)}
                className="text-xs text-red-600 hover:underline dark:text-red-300"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

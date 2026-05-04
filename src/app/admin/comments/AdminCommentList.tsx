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
    return <p className="text-gray-500 text-sm">No comments yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.authorName}</span>
                {comment.authorEmail && (
                  <span className="text-xs text-gray-500">{comment.authorEmail}</span>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {comment.content}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                on{" "}
                <Link
                  href={`/posts/${comment.post.slug}`}
                  className="hover:underline text-blue-600 dark:text-blue-400"
                >
                  {comment.post.title}
                </Link>
                {" "}&middot; {new Date(comment.createdAt).toLocaleDateString()}
              </p>
              {comment.parent && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Reply to: {comment.parent.authorName} — {comment.parent.content.slice(0, 80)}...
                </p>
              )}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">{reply.authorName}</span>: {reply.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  comment.approved
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                }`}
              >
                {comment.approved ? "Approved" : "Pending"}
              </span>
              {!comment.approved && (
                <button
                  onClick={() => toggleApprove(comment)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => deleteComment(comment.id)}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

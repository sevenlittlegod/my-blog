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
    fetchComments();
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
      setMessage("Comment submitted and pending approval.");
      fetchComments();
    } else {
      setMessage("Failed to submit. Please try again.");
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
        Comments ({comments.length})
      </h2>

      {/* Comment List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-3">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{comment.authorName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {replyTo === comment.id ? "Cancel" : "Reply"}
                </button>

                {replyTo === comment.id && (
                  <div className="mt-3 flex flex-col gap-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    <input
                      value={replyName}
                      onChange={(e) => setReplyName(e.target.value)}
                      className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Your name"
                    />
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Write a reply..."
                    />
                    <button
                      onClick={() => handleReply(comment.id)}
                      className="self-end rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {/* Nested Replies */}
                {comment.replies?.length > 0 && (
                  <div className="mt-3 pl-6 border-l-2 border-gray-200 dark:border-gray-700 flex flex-col gap-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{reply.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-gray-200 dark:border-gray-800 pt-6">
        <h3 className="text-lg font-semibold">Leave a Comment</h3>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name *"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email (optional)"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write a comment... *"
        />
        {message && (
          <p className="text-sm text-gray-500">{message}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="self-end rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Comment"}
        </button>
      </form>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { C } from "../lib/constants";
import { timeAgo } from "../utils/time";
import {
  RepostIcon,
  CommentIcon,
  SendIcon,
} from "./Icons";
import PostCard from "./PostCard";

function Avatar({ pseudonym, size = 32 }) {
  const colors = [
    "#9B6FD4",
    "#D4607A",
    "#6B9FD4",
    "#4CAF8F",
    "#D4A44C",
    "#E879F9",
  ];

  const color =
    colors[(pseudonym?.charCodeAt(0) || 0) % colors.length];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color + "22",
        border: `1.5px solid ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color,
          fontWeight: 700,
          fontSize: size * 0.42,
          fontFamily: "Nunito,sans-serif",
        }}
      >
        {pseudonym?.[0]?.toUpperCase() || "?"}
      </span>
    </div>
  );
}

export default function RepostCard({
  repostItem,
  onDeleted,
  onHidden,
  onEdited,
  onReposted,
  onUnreposted,
  currentUserId,
  currentPseudonym,
}) {
  const { user } = useAuth();

  const {
    repostId,
    reposterPseudonym,
    repostThought,
    repostCreatedAt,
    repostComments: initialComments = [],
    repostCommentCount: initialCount = 0,
    originalPost,
  } = repostItem || {};

  const [comments, setComments] = useState(initialComments || []);
  const [commentCount, setCommentCount] = useState(
    initialCount || initialComments?.length || 0
  );
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!originalPost) return null;

  const isRepostOwner =
    currentPseudonym === reposterPseudonym;

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim() || submitting || !repostId) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post(
        `/reposts/${repostId}/comments`,
        {
          text: commentText.trim(),
        }
      );

      if (res.data?.comment) {
        setComments((prev) => [
          ...prev,
          res.data.comment,
        ]);
      }

      setCommentCount(
        res.data?.repostCommentCount ??
          commentCount + 1
      );

      setCommentText("");
    } catch (e) {
      alert(
        e.response?.data?.message ||
          "Could not add your take."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article
      style={{
        backgroundColor: C.card,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      {/* Reposter header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px 8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <Avatar
            pseudonym={reposterPseudonym}
            size={34}
          />

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <RepostIcon
                size={15}
                color={C.accentSoft}
              />

              <span
                style={{
                  color: C.textMuted,
                  fontSize: 13,
                }}
              >
                <strong
                  style={{
                    color: C.accentSoft,
                  }}
                >
                  @{reposterPseudonym}
                </strong>{" "}
                shared a story
              </span>
            </div>

            <span
              style={{
                color: C.textMuted,
                fontSize: 11,
                display: "block",
                marginTop: 2,
              }}
            >
              {timeAgo(repostCreatedAt)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: C.textMuted,
            cursor: "pointer",
            fontSize: 18,
            padding: 4,
            flexShrink: 0,
          }}
          aria-label={
            collapsed
              ? "Expand repost"
              : "Collapse repost"
          }
        >
          {collapsed ? "⌄" : "⌃"}
        </button>
      </div>

      {/* Reposter thought */}
      {!!repostThought && !collapsed && (
        <div
          style={{
            padding: "2px 14px 10px",
          }}
        >
          <p
            style={{
              color: C.text,
              fontSize: 14,
              lineHeight: 1.6,
              fontStyle: "italic",
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            "{repostThought}"
          </p>
        </div>
      )}

      {/* Original post */}
      {!collapsed && (
        <div
          style={{
            margin: "0 10px 4px",
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}
        >
          <PostCard
            post={originalPost}
            onDeleted={onDeleted}
            onHidden={onHidden}
            onEdited={onEdited}
            onReposted={onReposted}
            onUnreposted={onUnreposted}
          />
        </div>
      )}

      {/* Repost comments */}
      {!collapsed && (
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <button
            type="button"
            onClick={() =>
              setCommentOpen((v) => !v)
            }
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 14px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <CommentIcon
              size={14}
              color={
                commentOpen
                  ? C.accent
                  : C.textMuted
              }
            />

            <span
              style={{
                color: commentOpen
                  ? C.accent
                  : C.textMuted,
                fontSize: 13,
                flex: 1,
              }}
            >
              {commentCount > 0
                ? `${commentCount} take${
                    commentCount !== 1
                      ? "s"
                      : ""
                  } on this repost`
                : "Add your take on this repost"}
            </span>

            <span
              style={{
                color: C.textMuted,
                fontSize: 12,
              }}
            >
              {commentOpen ? "⌃" : "⌄"}
            </span>
          </button>

          {commentOpen && (
            <div
              style={{
                padding: "0 14px 14px",
              }}
            >
              <div
                style={{
                  backgroundColor:
                    C.accent + "11",
                  border: `1px solid ${C.accent}33`,
                  borderRadius: 9,
                  padding: "8px 10px",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    color: C.textMuted,
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}
                >
                  These takes go to{" "}
                  <strong
                    style={{
                      color: C.accentSoft,
                    }}
                  >
                    @{reposterPseudonym}
                  </strong>
                  , not the original author.
                </span>
              </div>

              {/* Existing repost comments */}
              {comments.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {comments.map((comment, index) => (
                    <div
                      key={
                        comment._id ||
                        `repost-comment-${index}`
                      }
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <Avatar
                        pseudonym={comment.pseudonym}
                        size={28}
                      />

                      <div
                        style={{
                          flex: 1,
                          backgroundColor: C.bg,
                          border: `1px solid ${C.border}`,
                          borderRadius: 12,
                          padding: "8px 10px",
                          opacity:
                            comment.deleted
                              ? 0.6
                              : 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 3,
                          }}
                        >
                          <strong
                            style={{
                              color:
                                C.accentSoft,
                              fontSize: 12,
                            }}
                          >
                            @{comment.pseudonym}
                          </strong>

                          <span
                            style={{
                              color:
                                C.textMuted,
                              fontSize: 10,
                            }}
                          >
                            {timeAgo(
                              comment.createdAt
                            )}
                          </span>
                        </div>

                        <p
                          style={{
                            color:
                              comment.deleted
                                ? C.textMuted
                                : C.text,
                            fontSize: 12,
                            lineHeight: 1.5,
                            margin: 0,
                            fontStyle:
                              comment.deleted
                                ? "italic"
                                : "normal",
                            whiteSpace:
                              "pre-wrap",
                            wordBreak:
                              "break-word",
                          }}
                        >
                          {comment.text ||
                            "This comment was deleted."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {comments.length === 0 && (
                <p
                  style={{
                    color: C.textMuted,
                    fontSize: 12,
                    textAlign: "center",
                    margin: "8px 0 12px",
                  }}
                >
                  Be the first to share your take 💜
                </p>
              )}

              {/* Add repost comment */}
              <form
                onSubmit={handleSubmitComment}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <Avatar
                  pseudonym={
                    currentPseudonym ||
                    user?.pseudonym
                  }
                  size={28}
                />

                <input
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(e.target.value)
                  }
                  placeholder="Share your take on this repost…"
                  maxLength={500}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    backgroundColor: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "8px 11px",
                    color: C.text,
                    fontSize: 12,
                    outline: "none",
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    !commentText.trim() ||
                    submitting
                  }
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor:
                      !commentText.trim() ||
                      submitting
                        ? C.border
                        : C.accent,
                    border: "none",
                    cursor:
                      !commentText.trim() ||
                      submitting
                        ? "default"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <SendIcon
                    size={14}
                    color="#fff"
                  />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
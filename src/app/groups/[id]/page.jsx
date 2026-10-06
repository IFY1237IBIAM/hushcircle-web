"use client";

// Matches GroupChatScreen.js — web feature parity
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
// import Navbar from "../../../components/Navbar";
import HushCircleSpinner from "../../../components/HushCircleSpinner";
import NoNetworkOverlay from "../../../components/NoNetworkOverlay";
import UserProfileCard from "../../../components/UserProfileCard";
import AvatarVibeEmoji from "../../../components/AvatarVibeEmoji";
import { getLocalDateString } from "../../../utils/time";

const C = {
  bg: "#0F0A1E",
  card: "#1A1330",
  border: "#2D2450",
  accent: "#9B6FD4",
  accentSoft: "#C4A3E8",
  text: "#EDE8F5",
  textMuted: "#8B7FA8",
  success: "#4CAF8F",
  error: "#D4607A",
  warning: "#D4A44C",
  inputBg: "#0F0A1E",
};

const EDIT_WINDOW_MS = 5 * 60 * 1000;
const CIRCLE_KEEPER_EMAIL = "mom@gmail.com";

const canEdit = (post) =>
  Date.now() - new Date(post.createdAt).getTime() < EDIT_WINDOW_MS;

// ── SVG icons ─────────────────────────────────────────────────────────────
const BackIcon = ({ size = 22, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline
      points="15 18 9 12 15 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SendIcon = ({ size = 18, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M22 2L11 13"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22l-4-9-9-4 20-7z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} />
    <line
      x1="21"
      y1="21"
      x2="16.65"
      y2="16.65"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line
      x1="18"
      y1="6"
      x2="6"
      y2="18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <line
      x1="6"
      y1="6"
      x2="18"
      y2="18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
);

const PinIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EditIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline
      points="3 6 5 6 21 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ReplyIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline
      points="9 17 4 12 9 7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 18v-2a4 4 0 0 0-4-4H4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CopyIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      x="9"
      y="9"
      width="13"
      height="13"
      rx="2"
      ry="2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = ({ size = 13, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="11"
      width="18"
      height="11"
      rx="2"
      ry="2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 11V7a5 5 0 0 1 10 0v4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeartIcon = ({ size = 48, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={color + "33"}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrownIcon = ({ size = 12, color = "#FFD700" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M2 20h20M4 20l2-8 5 4 3-8 3 8 5-4 2 8"
      fill={color + "33"}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PendingIcon = ({ size = 11, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
    <path
      d="M12 7v5l3 3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Mood icons ────────────────────────────────────────────────────────────
const MoodIcons = {
  heartbreak: ({ size = 18, color = "#D4607A" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  fear: ({ size = 18, color = "#6B9FD4" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <path
        d="M8 15s1.5-2 4-2 4 2 4 2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1="9"
        y1="9"
        x2="9.01"
        y2="9"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="9"
        x2="15.01"
        y2="9"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  ),

  sadness: ({ size = 18, color = "#7B8FD4" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <path
        d="M16 16s-1.5-2-4-2-4 2-4 2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1="9"
        y1="9"
        x2="9.01"
        y2="9"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="9"
        x2="15.01"
        y2="9"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  ),

  struggle: ({ size = 18, color = "#D4A44C" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <path
        d="M8 14s1.5 1 4 1 4-1 4-1"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  ),

  hope: ({ size = 18, color = "#4CAF8F" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <path
        d="M8 13s1.5 2 4 2 4-2 4-2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  ),

  joy: ({ size = 18, color = "#9B6FD4" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <path
        d="M8 13s1.5 3 4 3 4-3 4-3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  ),

  calm: ({ size = 18, color = "#C4A3E8" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <path
        d="M9 13s1 1.5 3 1.5 3-1.5 3-1.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  ),
};

const MOOD_CONFIG = {
  heartbreak: {
    Icon: MoodIcons.heartbreak,
    color: "#D4607A",
  },
  fear: {
    Icon: MoodIcons.fear,
    color: "#6B9FD4",
  },
  sadness: {
    Icon: MoodIcons.sadness,
    color: "#7B8FD4",
  },
  struggle: {
    Icon: MoodIcons.struggle,
    color: "#D4A44C",
  },
  hope: {
    Icon: MoodIcons.hope,
    color: "#4CAF8F",
  },
  joy: {
    Icon: MoodIcons.joy,
    color: "#9B6FD4",
  },
  calm: {
    Icon: MoodIcons.calm,
    color: "#C4A3E8",
  },
};

// Backend currently accepts these five moods.
const MOODS = ["hope", "sadness", "struggle", "fear", "heartbreak"];

// ── Message ticks ─────────────────────────────────────────────────────────
function MessageTicks({ delivered, read, accentColor, mutedColor }) {
  if (read) {
    return (
      <svg width={18} height={11} viewBox="0 0 18 11" fill="none">
        <polyline
          points="1 5 4 8 10 2"
          stroke={accentColor}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="8 5 11 8 17 2"
          stroke={accentColor}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (delivered) {
    return (
      <svg width={18} height={11} viewBox="0 0 18 11" fill="none">
        <polyline
          points="1 5 4 8 10 2"
          stroke={mutedColor}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="8 5 11 8 17 2"
          stroke={mutedColor}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
      <polyline
        points="1 5 4 8 10 2"
        stroke={mutedColor}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatTime(d) {
  if (!d) return "";

  return new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateSeparator(d) {
  if (!d) return "";

  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MentionText({ text, accentColor }) {
  if (!text) return null;

  const parts = text.split(/(@\w+)/g);

  return (
    <span
      style={{
        fontSize: 15,
        lineHeight: 1.55,
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
      }}
    >
      {parts.map((p, i) =>
        /^@\w+/.test(p) ? (
          <span key={i} style={{ color: accentColor, fontWeight: 600 }}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────
function MessageBubble({
  post,
  isOwn,
  allPosts,
  onReply,
  onLongPress,
  onAvatarPress,
  localDate,
}) {
  const originalPost = post.replyTo
    ? allPosts.find(
        (p) => p._id === (post.replyTo?._id || post.replyTo)
      )
    : null;

  const isDeleted = post.deleted;
  const isPending = !!post.pending;
  const delivered = (post.deliveredTo?.length || 0) > 0;
  const read = (post.readBy?.length || 0) > 0;

  const moodCfg =
    post.mood && post.mood !== "hope"
      ? MOOD_CONFIG[post.mood]
      : null;

  // Important: use a variable instead of <moodCfg.Icon />.
  const MoodIcon = moodCfg?.Icon;

  const deletedLabel =
    post.deletedBy === "Crown_Keeper"
      ? post.deletedByPseudonym
        ? `Deleted by Crown_Keeper (@${post.deletedByPseudonym})`
        : "Deleted by Crown_Keeper"
      : "This message was deleted.";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        marginBottom: 6,
        alignItems: "flex-end",
        gap: 8,
        ...(isOwn
          ? {
              justifyContent: "flex-end",
              paddingLeft: 48,
            }
          : {
              justifyContent: "flex-start",
              paddingRight: 48,
            }),
      }}
    >
      {!isOwn && (
        <div
          onClick={() =>
            onAvatarPress && onAvatarPress(post.pseudonym)
          }
          style={{
            position: "relative",
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: C.accent + "33",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: "pointer",
            marginBottom: 2,
          }}
        >
          <span
            style={{
              color: C.accentSoft,
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {post.pseudonym?.[0]?.toUpperCase()}
          </span>

          <AvatarVibeEmoji
            pseudonym={post.pseudonym}
            localDate={localDate}
            size={10}
          />
        </div>
      )}

      <div
        onDoubleClick={() =>
          !isDeleted && !isPending && onLongPress(post)
        }
        style={{
          maxWidth: "80%",
          cursor: "context-menu",
        }}
        onContextMenu={(e) => {
          e.preventDefault();

          if (!isDeleted && !isPending) {
            onLongPress(post);
          }
        }}
      >
        <div
          style={{
            borderRadius: 18,
            padding: "10px 14px",
            ...(isOwn
              ? {
                  backgroundColor: "#2A1F4A",
                  borderBottomRightRadius: 4,
                  border: `1px solid ${C.accent}33`,
                }
              : {
                  backgroundColor: C.card,
                  borderBottomLeftRadius: 4,
                  border: `1px solid ${C.border}`,
                }),
            opacity: isDeleted ? 0.55 : isPending ? 0.7 : 1,
          }}
        >
          {!isOwn && (
            <p
              style={{
                color: C.accentSoft,
                fontWeight: 700,
                fontSize: 12,
                margin: "0 0 4px",
              }}
            >
              {post.pseudonym}
            </p>
          )}

          {originalPost && !isDeleted && (
            <div
              style={{
                display: "flex",
                marginBottom: 8,
                backgroundColor: C.inputBg,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 3,
                  backgroundColor: C.accent,
                }}
              />

              <div
                style={{
                  padding: 8,
                  flex: 1,
                }}
              >
                <p
                  style={{
                    color: C.accentSoft,
                    fontWeight: 700,
                    fontSize: 11,
                    margin: "0 0 2px",
                  }}
                >
                  {originalPost.pseudonym}
                </p>

                <p
                  style={{
                    color: C.textMuted,
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  {originalPost.deleted
                    ? "This message was deleted."
                    : originalPost.content}
                </p>
              </div>
            </div>
          )}

          {isDeleted ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {post.deletedBy === "Crown_Keeper" && (
                <CrownIcon size={11} color={C.textMuted} />
              )}

              <em
                style={{
                  color:
                    post.deletedBy === "Crown_Keeper"
                      ? "#A08060"
                      : C.textMuted,
                  fontSize: 14,
                }}
              >
                {deletedLabel}
              </em>
            </div>
          ) : (
            <MentionText
              text={post.content}
              accentColor={C.accentSoft}
            />
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 4,
              marginTop: 4,
            }}
          >
            {!isDeleted && MoodIcon && (
              <MoodIcon size={12} color={moodCfg.color} />
            )}

            {!isDeleted && post.isEdited && (
              <em
                style={{
                  color: C.textMuted,
                  fontSize: 9,
                }}
              >
                edited
              </em>
            )}

            <span
              style={{
                color: C.textMuted,
                fontSize: 10,
              }}
            >
              {formatTime(post.createdAt)}
            </span>

            {isOwn &&
              !isDeleted &&
              (isPending ? (
                <PendingIcon
                  size={11}
                  color={C.textMuted}
                />
              ) : (
                <MessageTicks
                  delivered={delivered}
                  read={read}
                  accentColor={C.accent}
                  mutedColor={C.textMuted}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mention Suggestions ──────────────────────────────────────────────────
function MentionSuggestions({ suggestions, onSelect }) {
  if (!suggestions.length) return null;

  return (
    <div
      style={{
        borderTop: `1px solid ${C.border}`,
        backgroundColor: C.card,
        padding: "6px 10px",
        display: "flex",
        gap: 6,
        overflowX: "auto",
      }}
    >
      {suggestions.map((member) => (
        <button
          key={member._id}
          onClick={() => onSelect(member.pseudonym)}
          style={{
            border: `1px solid ${C.border}`,
            backgroundColor: C.inputBg,
            color: C.accentSoft,
            borderRadius: 16,
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          @{member.pseudonym}
        </button>
      ))}
    </div>
  );
}

// ── Action Sheet ──────────────────────────────────────────────────────────
function ActionSheet({
  visible,
  isOwn,
  isDeleted,
  canStillEdit,
  isKeeper,
  onClose,
  onDelete,
  onCopy,
  onReply,
  onEdit,
  onPin,
}) {
  if (!visible) return null;

  const items = [];

  if (!isDeleted) {
    items.push({
      label: "Reply",
      Icon: ReplyIcon,
      color: C.text,
      onPress: onReply,
    });

    items.push({
      label: "Copy text",
      Icon: CopyIcon,
      color: C.text,
      onPress: onCopy,
    });

    items.push({
      label: "Pin message",
      Icon: PinIcon,
      color: C.accentSoft,
      onPress: onPin,
    });
  }

  if (isOwn && !isDeleted && canStillEdit) {
    items.push({
      label: "Edit message",
      Icon: EditIcon,
      color: C.text,
      onPress: onEdit,
    });
  }

  if ((isOwn || isKeeper) && !isDeleted) {
    items.push({
      label: "Delete message",
      Icon: TrashIcon,
      color: C.error,
      onPress: onDelete,
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: C.card,
          borderRadius: "20px 20px 0 0",
          paddingBottom: 32,
          paddingTop: 8,
          borderTop: `1px solid ${C.border}`,
          width: "100%",
          maxWidth: 560,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, i) => {
          const IIcon = item.Icon;

          return (
            <div key={i}>
              <button
                onClick={() => {
                  onClose();
                  item.onPress();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px 24px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <IIcon size={16} color={item.color} />

                <span
                  style={{
                    color: item.color,
                    fontWeight: 600,
                    fontSize: 16,
                    fontFamily: "Nunito,sans-serif",
                  }}
                >
                  {item.label}
                </span>
              </button>

              {i < items.length - 1 && (
                <div
                  style={{
                    height: 1,
                    backgroundColor: C.border,
                    margin: "0 16px",
                  }}
                />
              )}
            </div>
          );
        })}

        <div
          style={{
            height: 1,
            backgroundColor: C.border,
            margin: "0 16px",
          }}
        />

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "16px 24px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.textMuted,
            fontWeight: 600,
            fontSize: 16,
            fontFamily: "Nunito,sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Members Modal ─────────────────────────────────────────────────────────
function MembersModal({
  visible,
  onClose,
  members,
  loading: membersLoading,
  group,
}) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: C.card,
          borderRadius: "24px 24px 0 0",
          paddingBottom: 40,
          maxHeight: "85vh",
          width: "100%",
          maxWidth: 560,
          borderTop: `1px solid ${C.border}`,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: C.border,
            margin: "12px auto 4px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div>
            <p
              style={{
                color: C.text,
                fontWeight: 700,
                fontSize: 18,
                margin: 0,
              }}
            >
              {group?.name}
            </p>

            <p
              style={{
                color: C.textMuted,
                fontSize: 13,
                margin: 0,
              }}
            >
              {members.length} member
              {members.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: C.border,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloseIcon size={14} color={C.textMuted} />
          </button>
        </div>

        {membersLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: 32,
            }}
          >
            <Spinner />
          </div>
        ) : (
          members.map((m) => {
            const isKeeperM = m.email === CIRCLE_KEEPER_EMAIL;

            return (
              <div
                key={m._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: `1px solid ${C.border}55`,
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: C.accent + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: isKeeperM
                      ? `2px solid ${C.accent}`
                      : undefined,
                  }}
                >
                  <span
                    style={{
                      color: C.accentSoft,
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {m.pseudonym?.[0]?.toUpperCase()}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: C.text,
                      fontWeight: 600,
                      fontSize: 14,
                      margin: 0,
                    }}
                  >
                    @{m.pseudonym}
                  </p>

                  {isKeeperM && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: C.accent + "22",
                        borderRadius: 8,
                        padding: "2px 7px",
                        border: `1px solid ${C.accent}44`,
                        marginTop: 2,
                      }}
                    >
                      <CrownIcon size={10} color="#FFD700" />

                      <span
                        style={{
                          color: C.accentSoft,
                          fontWeight: 700,
                          fontSize: 10,
                        }}
                      >
                        Circle_Keeper
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        border: `2px solid ${C.accent}`,
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto",
      }}
    />
  );
}

// ── Main GroupChatPage ────────────────────────────────────────────────────
export default function GroupChatPage() {
  const router = useRouter();
  const params = useParams();

  const { user, loading } = useAuth();

  const groupId = params?.id;

  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const localDate = getLocalDateString();
  const draftKey = `draft_group_${groupId}`;

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);

  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [content, setContent] = useState("");
  const [mood, setMood] = useState("hope");
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [sending, setSending] = useState(false);

  const [showNoNetwork, setShowNoNetwork] = useState(false);
  const [spinnerVisible, setSpinnerVisible] = useState(false);
  const [spinnerMsg, setSpinnerMsg] = useState("");

  const [showActionSheet, setShowActionSheet] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [replyTarget, setReplyTarget] = useState(null);

  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [isGroupClosed, setIsGroupClosed] = useState(false);
  const [isKeeper, setIsKeeper] = useState(false);
  const [isRemovedMember, setIsRemovedMember] = useState(false);
  const [myMuteInfo, setMyMuteInfo] = useState(null);

  const [typingUsers, setTypingUsers] = useState([]);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showMembers, setShowMembers] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  const [showProfileCard, setShowProfileCard] = useState(false);
  const [profilePseudonym, setProfilePseudonym] = useState(null);

  const [failedMessage, setFailedMessage] = useState(null);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const loadAll = useCallback(async () => {
    if (!user || !groupId) return;

    setFetching(true);

    try {
      const [gr, mr, msgr] = await Promise.all([
        api
          .get(`/groups/${groupId}`)
          .catch(() => ({ data: { group: null } })),

        api
          .get(`/groups/${groupId}/members`)
          .catch(() => ({
            data: {
              members: [],
              isClosed: false,
              pinnedMessage: null,
            },
          })),

        api
          .get(`/groups/${groupId}/posts?limit=30`)
          .catch(() => ({
            data: {
              posts: [],
            },
          })),
      ]);

      setGroup(gr.data.group);

      const memberList = mr.data.members || [];

      setMembers(memberList);
      setIsGroupClosed(mr.data.isClosed || false);
      setPinnedMessage(mr.data.pinnedMessage || null);

      const me = memberList.find(
        (m) =>
          m._id?.toString() === user?._id?.toString() ||
          m.id?.toString() === user?.id?.toString() ||
          m.pseudonym === user?.pseudonym
      );

      setIsKeeper(
        me?.email === CIRCLE_KEEPER_EMAIL ||
          mr.data.creatorId?.toString() === me?._id?.toString()
      );

      setMyMuteInfo(
        me?.isMuted
          ? {
              reason: me.muteReason || "",
              expiresAt: me.muteExpiresAt || null,
            }
          : null
      );

      const psts = msgr.data.posts || [];

      setPosts(psts);
      setHasMore(psts.length === 30);
      setIsRemovedMember(msgr.data.isRemovedMember || false);
      setShowNoNetwork(false);

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "auto",
        });
      }, 100);
    } catch (e) {
      if (e.message === "Network Error") {
        setShowNoNetwork(true);
      }
    } finally {
      setFetching(false);
    }
  }, [groupId, user]);

  useEffect(() => {
    if (!user || !groupId) return;

    loadAll();

    try {
      const draft = localStorage.getItem(draftKey);

      if (draft) {
        setContent(draft);
      }
    } catch {}
  }, [user, groupId, draftKey, loadAll]);

  const fetchMorePosts = async () => {
    if (loadingMore || !hasMore || !posts.length) return;

    setLoadingMore(true);

    try {
      const res = await api.get(
        `/groups/${groupId}/posts?firstId=${posts[0]._id}&limit=30`
      );

      const older = res.data.posts || [];

      setPosts((prev) => [
        ...older.filter(
          (p) => !prev.some((existing) => existing._id === p._id)
        ),
        ...prev,
      ]);

      setHasMore(older.length === 30);
    } catch {
      // Keep current messages if loading older messages fails.
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    const trimmed = content.trim();

    if (!trimmed || sending) return;

    if (isRemovedMember) {
      return;
    }

    if (myMuteInfo) {
      return;
    }

    if (isGroupClosed && !isKeeper) {
      alert(
        "The Circle_Keeper has temporarily closed this circle."
      );
      return;
    }

    // IMPORTANT:
    // Capture these before clearing the UI state.
    const currentReplyTarget = replyTarget;
    const replyToId = currentReplyTarget?._id || null;
    const currentMood = mood;

    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    const optimistic = {
      _id: tempId,
      author: user?._id,
      pseudonym: user?.pseudonym,
      content: trimmed,
      mood: currentMood,
      replyTo: replyToId,
      deliveredTo: [],
      readBy: [],
      createdAt: new Date().toISOString(),
      isEdited: false,
      deleted: false,
      pending: true,
    };

    setSending(true);

    // Clear UI immediately, matching mobile.
    setContent("");
    setReplyTarget(null);
    setMentionSuggestions([]);
    setShowMoodPicker(false);

    try {
      localStorage.removeItem(draftKey);
    } catch {}

    setPosts((prev) => [...prev, optimistic]);

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 80);

    try {
      const res = await api.post(
        `/groups/${groupId}/posts`,
        {
          content: trimmed,
          mood: currentMood,
          replyTo: replyToId,
        }
      );

      setPosts((prev) => {
        if (
          prev.some(
            (p) => p._id === res.data.post._id
          )
        ) {
          return prev.filter(
            (p) => p._id !== tempId
          );
        }

        return prev.map((p) =>
          p._id === tempId
            ? res.data.post
            : p
        );
      });

      if (res.data.crisisDetected) {
        alert(
          res.data.crisisMessage ||
            "It sounds like you may be going through something difficult. Please reach out to someone you trust."
        );
      }
    } catch (e) {
      setPosts((prev) =>
        prev.filter((p) => p._id !== tempId)
      );

      setFailedMessage({
        text: trimmed,
        replyTo: currentReplyTarget,
      });
    } finally {
      setSending(false);
    }
  };

  const handleRetryFailed = () => {
    if (!failedMessage) return;

    setContent(failedMessage.text);
    setReplyTarget(failedMessage.replyTo || null);
    setFailedMessage(null);

    setTimeout(() => {
      document.querySelector("textarea")?.focus();
    }, 50);
  };

  const handleDeletePost = async () => {
    if (!actionTarget) return;

    try {
      await api.delete(
        `/groups/${groupId}/posts/${actionTarget._id}`
      );

      const isSelf =
        actionTarget.pseudonym === user?.pseudonym;

      setPosts((prev) =>
        prev.map((p) =>
          p._id === actionTarget._id
            ? {
                ...p,
                deleted: true,
                deletedBy: isSelf
                  ? "self"
                  : "Crown_Keeper",
                deletedByPseudonym: isSelf
                  ? null
                  : user?.pseudonym,
              }
            : p
        )
      );
    } catch (e) {
      alert(
        e.response?.data?.message ||
          "Could not delete message."
      );
    }
  };

  const handleCopyPost = async () => {
    if (!actionTarget?.content) return;

    try {
      await navigator.clipboard.writeText(
        actionTarget.content
      );

      alert("Message copied to clipboard.");
    } catch {
      alert("Could not copy message.");
    }
  };

  const handleEditStart = () => {
    if (!actionTarget) return;

    setEditingPost(actionTarget);
    setEditContent(actionTarget.content || "");
  };

  const handleEditSave = async () => {
    if (!editContent.trim() || !editingPost) return;

    try {
      await api.put(
        `/groups/${groupId}/posts/${editingPost._id}`,
        {
          content: editContent.trim(),
        }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p._id === editingPost._id
            ? {
                ...p,
                content: editContent.trim(),
                isEdited: true,
              }
            : p
        )
      );

      setEditingPost(null);
      setEditContent("");
    } catch (e) {
      alert(
        e.response?.data?.message ||
          "Could not edit message."
      );
    }
  };

  const handleOpenMembers = async () => {
    setMembersLoading(true);
    setShowMembers(true);

    try {
      const res = await api.get(
        `/groups/${groupId}/members`
      );

      setMembers(res.data.members || []);

      if (typeof res.data.isClosed === "boolean") {
        setIsGroupClosed(res.data.isClosed);
      }

      if (res.data.pinnedMessage !== undefined) {
        setPinnedMessage(res.data.pinnedMessage);
      }
    } catch {
      // Keep existing member list.
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAvatarPress = useCallback(
    (pseudonym) => {
      if (
        !pseudonym ||
        pseudonym === user?.pseudonym
      ) {
        return;
      }

      setProfilePseudonym(pseudonym);
      setShowProfileCard(true);
    },
    [user?.pseudonym]
  );

  const handleContentChange = (val) => {
    setContent(val);

    try {
      localStorage.setItem(draftKey, val);
    } catch {}

    // Mention suggestions — matching mobile behavior.
    const words = val.split(" ");
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      const query = lastWord
        .slice(1)
        .toLowerCase();

      const base = members.filter(
        (m) =>
          m.pseudonym?.toLowerCase() !==
          user?.pseudonym?.toLowerCase()
      );

      if (query === "") {
        setMentionSuggestions([
          {
            _id: "all",
            pseudonym: "all",
          },
          ...base.slice(0, 6),
        ]);
      } else if (query === "all") {
        setMentionSuggestions([
          {
            _id: "all",
            pseudonym: "all",
          },
        ]);
      } else {
        setMentionSuggestions(
          base
            .filter((m) =>
              m.pseudonym
                ?.toLowerCase()
                .startsWith(query)
            )
            .slice(0, 6)
        );
      }
    } else {
      setMentionSuggestions([]);
    }
  };

  const handleMentionSelect = (pseudonym) => {
    const words = content.split(" ");

    words[words.length - 1] = `@${pseudonym} `;

    const nextContent = words.join(" ");

    setContent(nextContent);
    setMentionSuggestions([]);

    try {
      localStorage.setItem(
        draftKey,
        nextContent
      );
    } catch {}

    setTimeout(() => {
      document.querySelector("textarea")?.focus();
    }, 50);
  };

  const listData = useMemo(() => {
    const source =
      showSearch && searchQuery.trim()
        ? posts.filter(
            (p) =>
              p.content
                ?.toLowerCase()
                .includes(
                  searchQuery.toLowerCase()
                ) ||
              p.pseudonym
                ?.toLowerCase()
                .includes(
                  searchQuery.toLowerCase()
                )
          )
        : posts;

    const items = [];
    let lastDate = null;

    for (const post of source) {
      const dateStr = new Date(
        post.createdAt
      ).toDateString();

      if (dateStr !== lastDate) {
        items.push({
          type: "separator",
          date: post.createdAt,
          key: `sep-${dateStr}`,
        });

        lastDate = dateStr;
      }

      items.push({
        type: "message",
        post,
        key: post._id,
      });
    }

    return items;
  }, [posts, showSearch, searchQuery]);

  const currentMoodCfg =
    MOOD_CONFIG[mood] ||
    MOOD_CONFIG.hope;

  const CurrentMoodIcon =
    currentMoodCfg.Icon;

  const isInputDisabled =
    isRemovedMember ||
    (isGroupClosed && !isKeeper) ||
    !!myMuteInfo ||
    sending;

  const getMuteLabel = () => {
    if (!myMuteInfo) return "";

    const base = myMuteInfo.reason
      ? `Muted: "${myMuteInfo.reason}"`
      : "You are muted";

    if (myMuteInfo.expiresAt) {
      const diff =
        new Date(myMuteInfo.expiresAt) -
        new Date();

      if (diff > 0) {
        return `${base} · ${Math.ceil(
          diff / (1000 * 60 * 60)
        )}h remaining`;
      }
    }

    return `${base} · Permanent`;
  };

  const inputPlaceholder = isRemovedMember
    ? "You were removed from this circle."
    : myMuteInfo
    ? getMuteLabel()
    : isGroupClosed && !isKeeper
    ? "Circle is closed..."
    : editingPost
    ? "Edit your message..."
    : "Message the circle...";

  if (loading || !user) return null;

  const HEADER_H = 56;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: C.bg,
        overflow: "hidden",
      }}
    >
  

      {/* ── Sub-header ── */}
      <div
        style={{
          position: "sticky",
          top: HEADER_H,
          zIndex: 30,
          backgroundColor: C.card,
          borderBottom: `1px solid ${C.border}`,
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            onClick={() => router.push("/groups")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 8,
            }}
          >
            <BackIcon
              size={22}
              color={C.accent}
            />
          </button>

          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: C.accent + "22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${C.accent}44`,
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {group?.icon || "💬"}
          </div>

          <div style={{ flex: 1 }}>
            <p
              style={{
                color: C.text,
                fontWeight: 700,
                fontSize: 16,
                margin: 0,
              }}
            >
              {group?.name || "Circle"}
            </p>

            <button
              onClick={handleOpenMembers}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span
                style={{
                  color: C.accentSoft,
                  fontSize: 12,
                }}
              >
                {members.length ||
                  group?.memberCount ||
                  0}{" "}
                members ›
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              setShowSearch(!showSearch);
              setSearchQuery("");
              setShowMoodPicker(false);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              display: "flex",
              alignItems: "center",
            }}
          >
            {showSearch ? (
              <CloseIcon
                size={18}
                color={C.textMuted}
              />
            ) : (
              <SearchIcon
                size={18}
                color={C.textMuted}
              />
            )}
          </button>
        </div>

        {/* Search bar */}
        {showSearch && (
          <>
            <div
              style={{
                maxWidth: 680,
                margin: "8px auto 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: C.inputBg,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                padding: "8px 12px",
              }}
            >
              <SearchIcon
                size={15}
                color={C.textMuted}
              />

              <input
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Search messages or @mentions..."
                autoFocus
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  color: C.text,
                  fontSize: 15,
                  outline: "none",
                }}
              />

              {searchQuery && (
                <button
                  onClick={() =>
                    setSearchQuery("")
                  }
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <CloseIcon
                    size={14}
                    color={C.textMuted}
                  />
                </button>
              )}
            </div>

            {searchQuery.trim() && (
              <div
                style={{
                  maxWidth: 680,
                  margin: "6px auto 0",
                  color: C.textMuted,
                  fontSize: 12,
                }}
              >
                {
                  listData.filter(
                    (item) =>
                      item.type === "message"
                  ).length
                }{" "}
                result
                {listData.filter(
                  (item) =>
                    item.type === "message"
                ).length !== 1
                  ? "s"
                  : ""}{" "}
                for "{searchQuery}"
              </div>
            )}
          </>
        )}

        {/* Pinned banner */}
        {pinnedMessage?.content && (
          <div
            onClick={() => {
              if (!pinnedMessage?.postId)
                return;

              const el = document.getElementById(
                `message-${pinnedMessage.postId}`
              );

              el?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
            style={{
              maxWidth: 680,
              margin: "8px auto 0",
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor:
                C.accent + "18",
              borderRadius: 10,
              padding: "7px 12px",
              border: `1px solid ${C.accent}33`,
              cursor: "pointer",
            }}
          >
            <PinIcon
              size={13}
              color={C.accentSoft}
            />

            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: C.accentSoft,
                  fontWeight: 700,
                  fontSize: 10,
                  margin: "0 0 1px",
                  letterSpacing: 0.4,
                }}
              >
                Pinned message
              </p>

              <p
                style={{
                  color: C.textMuted,
                  fontSize: 12,
                  margin: 0,
                }}
              >
                {pinnedMessage.content}
              </p>
            </div>
          </div>
        )}

        {/* Closed banner */}
        {isGroupClosed && (
          <div
            style={{
              maxWidth: 680,
              margin: "8px auto 0",
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor:
                C.error + "18",
              borderRadius: 10,
              padding: "7px 12px",
              border: `1px solid ${C.error}33`,
            }}
          >
            <LockIcon
              size={13}
              color={C.error}
            />

            <span
              style={{
                color: C.error,
                fontSize: 12,
              }}
            >
              Circle closed —{" "}
              {isKeeper
                ? "posting paused"
                : "posting paused"}
            </span>
          </div>
        )}

        {/* Removed banner */}
        {isRemovedMember && (
          <div
            style={{
              maxWidth: 680,
              margin: "8px auto 0",
              backgroundColor:
                C.warning + "18",
              borderRadius: 10,
              padding: "7px 12px",
              border: `1px solid ${C.warning}33`,
            }}
          >
            <span
              style={{
                color: C.warning,
                fontSize: 12,
              }}
            >
              You were removed from this circle.
              You can view messages but cannot
              post.
            </span>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 12px 8px",
        }}
        onScroll={(e) => {
          if (e.target.scrollTop < 100) {
            fetchMorePosts();
          }
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          {fetching && (
            <div
              style={{
                textAlign: "center",
                padding: 40,
              }}
            >
              <Spinner />
            </div>
          )}

          {loadingMore && (
            <div
              style={{
                textAlign: "center",
                padding: 8,
              }}
            >
              <Spinner />
            </div>
          )}

          {!fetching &&
            listData.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  paddingTop: 80,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: C.card,
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  {showSearch ? (
                    <SearchIcon
                      size={40}
                      color={C.textMuted}
                    />
                  ) : (
                    <HeartIcon
                      size={40}
                      color={C.accent}
                    />
                  )}
                </div>

                <p
                  style={{
                    color: C.text,
                    fontFamily:
                      "DM Serif Display,Georgia,serif",
                    fontSize: 22,
                    marginBottom: 8,
                  }}
                >
                  {showSearch
                    ? "No messages found"
                    : "No messages yet"}
                </p>

                <p
                  style={{
                    color: C.textMuted,
                    fontSize: 14,
                  }}
                >
                  {showSearch
                    ? "Try a different search term"
                    : "Be the first to share in this circle"}
                </p>
              </div>
            )}

          {listData.map((item) => {
            if (item.type === "separator") {
              return (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "16px 0",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: C.border,
                    }}
                  />

                  <span
                    style={{
                      color: C.textMuted,
                      fontSize: 11,
                    }}
                  >
                    {formatDateSeparator(
                      item.date
                    )}
                  </span>

                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: C.border,
                    }}
                  />
                </div>
              );
            }

            const post = item.post;
            const isOwn =
              post.pseudonym ===
              user?.pseudonym;

            return (
              <div
                key={item.key}
                id={`message-${post._id}`}
              >
                <MessageBubble
                  post={post}
                  isOwn={isOwn}
                  allPosts={posts}
                  onReply={() =>
                    setReplyTarget(post)
                  }
                  onLongPress={(p) => {
                    setActionTarget(p);
                    setShowActionSheet(true);
                  }}
                  onAvatarPress={
                    handleAvatarPress
                  }
                  localDate={localDate}
                />
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Typing bar ── */}
      {typingUsers.length > 0 && (
        <div
          style={{
            padding: "6px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 3,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor:
                    C.accentSoft,
                  opacity: 1 - i * 0.3,
                }}
              />
            ))}
          </div>

          <em
            style={{
              color: C.textMuted,
              fontSize: 12,
            }}
          >
            {typingUsers[0].pseudonym} is
            typing...
          </em>
        </div>
      )}

      {/* Mention suggestions */}
      {!showSearch &&
        mentionSuggestions.length > 0 && (
          <MentionSuggestions
            suggestions={mentionSuggestions}
            onSelect={handleMentionSelect}
          />
        )}

      {/* Failed message bar */}
      {failedMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: C.error + "18",
            padding: "8px 14px",
            borderTop: `1px solid ${C.error}33`,
          }}
        >
          <span
            style={{
              color: C.error,
              fontSize: 12,
              flex: 1,
            }}
          >
            Failed to send: "
            {failedMessage.text.slice(
              0,
              50
            )}
            "
          </span>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              onClick={handleRetryFailed}
              style={{
                backgroundColor:
                  C.error + "22",
                color: C.error,
                border: `1px solid ${C.error}44`,
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>

            <button
              onClick={() =>
                setFailedMessage(null)
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <CloseIcon
                size={14}
                color={C.textMuted}
              />
            </button>
          </div>
        </div>
      )}

      {/* Mute bar */}
      {myMuteInfo && (
        <div
          style={{
            backgroundColor:
              C.warning + "18",
            borderTop: `1px solid ${C.warning}33`,
            padding: "10px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <LockIcon
            size={13}
            color={C.warning}
          />

          <div>
            <p
              style={{
                color: C.warning,
                fontWeight: 700,
                fontSize: 12,
                margin: "0 0 2px",
              }}
            >
              You are muted in this circle
            </p>

            {myMuteInfo.reason && (
              <p
                style={{
                  color: C.textMuted,
                  fontSize: 11,
                  fontStyle: "italic",
                  margin: "0 0 2px",
                }}
              >
                "{myMuteInfo.reason}"
              </p>
            )}

            <p
              style={{
                color: C.textMuted,
                fontSize: 11,
                margin: 0,
              }}
            >
              {myMuteInfo.expiresAt
                ? `Expires: ${new Date(
                    myMuteInfo.expiresAt
                  ).toLocaleString()}`
                : "Duration: Permanent"}
            </p>
          </div>
        </div>
      )}

      {/* Reply preview */}
      {replyTarget && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            backgroundColor: C.card,
            borderTop: `1px solid ${C.border}`,
            padding: "8px 12px",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 3,
              minHeight: 36,
              backgroundColor: C.accent,
              borderRadius: 2,
            }}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 2,
              }}
            >
              <ReplyIcon
                size={12}
                color={C.accentSoft}
              />

              <span
                style={{
                  color: C.accentSoft,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                Replying to{" "}
                {replyTarget.pseudonym}
              </span>
            </div>

            <p
              style={{
                color: C.textMuted,
                fontSize: 12,
                margin: 0,
              }}
            >
              {replyTarget.deleted
                ? "This message was deleted."
                : replyTarget.content}
            </p>
          </div>

          <button
            onClick={() =>
              setReplyTarget(null)
            }
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
            }}
          >
            <CloseIcon
              size={14}
              color={C.textMuted}
            />
          </button>
        </div>
      )}

      {/* Edit bar */}
      {editingPost && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: C.accent + "18",
            padding: "8px 14px",
            borderTop: `1px solid ${C.accent}33`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <EditIcon
              size={14}
              color={C.accentSoft}
            />

            <span
              style={{
                color: C.accentSoft,
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Editing message
            </span>
          </div>

          <button
            onClick={() => {
              setEditingPost(null);
              setEditContent("");
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <CloseIcon
              size={14}
              color={C.textMuted}
            />
          </button>
        </div>
      )}

      {/* ── Compose ── */}
      {!showSearch && (
        <div
          style={{
            backgroundColor: C.card,
            borderTop: `1px solid ${C.border}`,
            paddingBottom: 10,
          }}
        >
          {/* Mood picker */}
          {showMoodPicker && !editingPost && (
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "10px 16px",
                borderBottom: `1px solid ${C.border}`,
                overflowX: "auto",
                scrollbarWidth: "none",
              }}
            >
              {MOODS.map((mKey) => {
                const cfg =
                  MOOD_CONFIG[mKey];

                const MIcon = cfg.Icon;
                const selected =
                  mood === mKey;

                return (
                  <button
                    key={mKey}
                    onClick={() => {
                      setMood(mKey);
                      setShowMoodPicker(false);
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: selected
                        ? C.accent + "22"
                        : C.inputBg,
                      border: `1px solid ${
                        selected
                          ? C.accent
                          : C.border
                      }`,
                      cursor: isInputDisabled
                        ? "not-allowed"
                        : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      flexShrink: 0,
                      opacity:
                        isInputDisabled
                          ? 0.4
                          : 1,
                    }}
                    disabled={
                      isInputDisabled
                    }
                  >
                    <MIcon
                      size={20}
                      color={
                        selected
                          ? cfg.color
                          : C.textMuted
                      }
                    />
                  </button>
                );
              })}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              padding: 10,
              gap: 8,
              maxWidth: 680,
              margin: "0 auto",
            }}
          >
            {/* Mood button */}
            {!editingPost && (
              <button
                onClick={() =>
                  !isInputDisabled &&
                  setShowMoodPicker(
                    !showMoodPicker
                  )
                }
                disabled={isInputDisabled}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor:
                    C.inputBg,
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  cursor: isInputDisabled
                    ? "not-allowed"
                    : "pointer",
                  flexShrink: 0,
                  opacity:
                    isInputDisabled
                      ? 0.3
                      : 1,
                }}
              >
                <CurrentMoodIcon
                  size={20}
                  color={currentMoodCfg.color}
                />
              </button>
            )}

            {/* Text input */}
            <textarea
              value={
                editingPost
                  ? editContent
                  : content
              }
              onChange={(e) => {
                if (editingPost) {
                  setEditContent(
                    e.target.value
                  );
                } else {
                  handleContentChange(
                    e.target.value
                  );
                }
              }}
              placeholder={
                editingPost
                  ? "Edit your message..."
                  : inputPlaceholder
              }
              disabled={
                isInputDisabled &&
                !editingPost
              }
              rows={1}
              maxLength={500}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();

                  if (editingPost) {
                    handleEditSave();
                  } else {
                    handleSend();
                  }
                }
              }}
              style={{
                flex: 1,
                backgroundColor:
                  C.inputBg,
                borderRadius: 20,
                border: `1px solid ${C.border}`,
                padding: "10px 14px",
                color:
                  isInputDisabled &&
                  !editingPost
                    ? C.textMuted
                    : C.text,
                fontSize: 15,
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
                maxHeight: 120,
                minHeight: 40,
                overflowY: "auto",
              }}
            />

            {/* Send / Save */}
            <button
              onClick={
                editingPost
                  ? handleEditSave
                  : handleSend
              }
              disabled={
                editingPost
                  ? !editContent.trim()
                  : !content.trim() ||
                    isInputDisabled
              }
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  C.accent,
                border: "none",
                cursor:
                  editingPost
                    ? !editContent.trim()
                      ? "not-allowed"
                      : "pointer"
                    : !content.trim() ||
                      isInputDisabled
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                flexShrink: 0,
                opacity:
                  editingPost
                    ? !editContent.trim()
                      ? 0.35
                      : 1
                    : !content.trim() ||
                      isInputDisabled
                    ? 0.35
                    : 1,
              }}
            >
              {sending ? (
                <div
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor:
                      "#fff",
                    animation:
                      "spin 0.7s linear infinite",
                  }}
                />
              ) : (
                <SendIcon
                  size={16}
                  color="#fff"
                />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ActionSheet
        visible={showActionSheet}
        isOwn={
          actionTarget?.pseudonym ===
          user?.pseudonym
        }
        isDeleted={actionTarget?.deleted}
        canStillEdit={
          actionTarget
            ? canEdit(actionTarget)
            : false
        }
        isKeeper={isKeeper}
        onClose={() => {
          setShowActionSheet(false);
          setActionTarget(null);
        }}
        onDelete={handleDeletePost}
        onCopy={handleCopyPost}
        onReply={() => {
          setReplyTarget(
            actionTarget
          );
        }}
        onEdit={handleEditStart}
        onPin={async () => {
          if (!actionTarget) return;

          try {
            const res =
              await api.post(
                `/groups/${groupId}/pin`,
                {
                  content:
                    actionTarget.content,
                  postId:
                    actionTarget._id,
                  duration: "24h",
                }
              );

            setPinnedMessage(
              res.data.pinnedMessage
            );
          } catch (e) {
            alert(
              e.response?.data?.message ||
                "Could not pin message."
            );
          }
        }}
      />

      <MembersModal
        visible={showMembers}
        onClose={() =>
          setShowMembers(false)
        }
        members={members}
        loading={membersLoading}
        group={group}
      />

      {showProfileCard && (
        <UserProfileCard
          pseudonym={profilePseudonym}
          visible={showProfileCard}
          onClose={() => {
            setShowProfileCard(false);
            setProfilePseudonym(null);
          }}
        />
      )}

      <HushCircleSpinner
        visible={spinnerVisible}
        message={spinnerMsg}
      />

      <NoNetworkOverlay
        visible={showNoNetwork}
        action="feed"
        onClose={() =>
          setShowNoNetwork(false)
        }
        onRetry={() => {
          setShowNoNetwork(false);
          loadAll();
        }}
      />

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
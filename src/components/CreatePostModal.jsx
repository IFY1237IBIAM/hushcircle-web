"use client";

import { useState } from "react";
import api from "../lib/api";
import { MOOD_CONFIG, COLORS as C } from "../lib/constants";
import { SendIcon, CheckIcon } from "./Icons";

export default function CreatePostModal({ onClose, onCreated }) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const closeModal = () => {
    if (submitting) return;
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!content.trim()) {
      setError("Write something first.");
      return;
    }

    if (!mood) {
      setError("Select how you're feeling.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.post("/posts", {
        content: content.trim(),
        mood,
      });

      // Make sure the submitting state is cleared
      // before telling the parent that the post was created.
      setSubmitting(false);

      onCreated?.(res.data.post);
    } catch (err) {
      console.error("Create post error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not post. Please try again."
      );

      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
        padding: 0,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          closeModal();
        }
      }}
    >
      <div
        style={{
          backgroundColor: C.card,
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          border: `1px solid ${C.border}`,
          borderBottom: "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              color: C.text,
              fontFamily: "DM Serif Display, Georgia, serif",
              fontSize: 22,
              margin: 0,
            }}
          >
            Share how you feel
          </h2>

          <button
            type="button"
            onClick={closeModal}
            disabled={submitting}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              color: C.textMuted,
              fontSize: 30,
              cursor: submitting ? "not-allowed" : "pointer",
              lineHeight: 1,
              padding: "6px 10px",
              opacity: submitting ? 0.5 : 1,
              pointerEvents: submitting ? "none" : "auto",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Mood picker */}
          <p
            style={{
              color: C.textMuted,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              marginBottom: 10,
            }}
          >
            How are you feeling?
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              marginBottom: 18,
            }}
          >
            {Object.values(MOOD_CONFIG).map((m) => {
              const MIcon = m.Icon;

              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    if (!submitting) {
                      setMood(m.key);
                      setError("");
                    }
                  }}
                  disabled={submitting}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "12px 6px",
                    borderRadius: 14,
                    border: `1.5px solid ${
                      mood === m.key ? m.color : C.border
                    }`,
                    backgroundColor:
                      mood === m.key ? m.color + "18" : C.bg,
                    cursor: submitting ? "not-allowed" : "pointer",
                    position: "relative",
                    transition: "all 0.15s",
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  <MIcon
                    size={28}
                    color={mood === m.key ? m.color : C.textMuted}
                  />

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: mood === m.key ? m.color : C.textMuted,
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {m.label}
                  </span>

                  {mood === m.key && (
                    <div
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: m.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckIcon size={9} color="#fff" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <p
            style={{
              color: C.textMuted,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              marginBottom: 8,
            }}
          >
            What's on your mind?
          </p>

          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError("");
            }}
            placeholder="This is a safe, anonymous space. Share freely 💜"
            maxLength={500}
            rows={5}
            disabled={submitting}
            style={{
              width: "100%",
              backgroundColor: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "12px 14px",
              color: C.text,
              fontSize: 14,
              lineHeight: 1.6,
              resize: "none",
              outline: "none",
              fontFamily: "Nunito, sans-serif",
              boxSizing: "border-box",
              opacity: submitting ? 0.7 : 1,
            }}
            onFocus={(e) => {
              if (!submitting) {
                e.target.style.borderColor = C.accent;
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = C.border;
            }}
          />

          <p
            style={{
              color: C.textMuted,
              fontSize: 11,
              textAlign: "right",
              margin: "4px 0 16px",
            }}
          >
            {content.length}/500
          </p>

          {error && (
            <p
              style={{
                color: C.error,
                fontSize: 13,
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              {error}
            </p>
          )}

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              style={{
                flex: 1,
                padding: "14px 0",
                backgroundColor: "transparent",
                color: C.textMuted,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !content.trim() || !mood}
              style={{
                flex: 2,
                padding: "14px 0",
                backgroundColor: C.accent,
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 700,
                cursor:
                  submitting || !content.trim() || !mood
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  submitting || !content.trim() || !mood ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {submitting ? (
                "Posting..."
              ) : (
                <>
                  <SendIcon size={14} color="#fff" />
                  Share anonymously 💜
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
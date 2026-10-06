"use client";
// Matches mobile HashtagText.js — tappable purple hashtags
export default function HashtagText({ text, onHashtagPress, style, numberOfLines }) {
  if (!text) return null;
  const parts = text.split(/(#\w+)/g);
  return (
    <p style={{ ...style, margin: 0, ...(numberOfLines ? { overflow: "hidden", display: "-webkit-box", WebkitLineClamp: numberOfLines, WebkitBoxOrient: "vertical" } : {}) }}>
      {parts.map((part, i) =>
        /^#\w+/.test(part) ? (
          <span key={i} onClick={() => onHashtagPress?.(part.toLowerCase())}
            style={{ color: "#9B6FD4", fontWeight: 600, cursor: "pointer" }}>
            {part}
          </span>
        ) : <span key={i}>{part}</span>
      )}
    </p>
  );
}

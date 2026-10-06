"use client";
// Matches mobile AvatarVibeEmoji.js — floating mood emoji on avatar
// In-memory cache: keyed by pseudonym:localDate
import { useEffect, useState, useRef } from "react";
import api from "../lib/api";

const vibeCache = {};

export function clearVibeCache() {
  Object.keys(vibeCache).forEach(k => delete vibeCache[k]);
}

export default function AvatarVibeEmoji({ pseudonym, size = 13, localDate }) {
  const [vibe,    setVibe]    = useState(null);
  const [opacity, setOpacity] = useState(0);
  const [floatY,  setFloatY]  = useState(0);
  const floatRef = useRef(null);

  const today    = localDate || new Date().toISOString().split("T")[0];
  const cacheKey = `${pseudonym}:${today}`;

  useEffect(() => {
    if (!pseudonym) return;
    if (vibeCache[cacheKey] !== undefined) {
      if (vibeCache[cacheKey]) { setVibe(vibeCache[cacheKey]); setTimeout(() => setOpacity(1), 50); }
      return;
    }
    let cancelled = false;
    api.get(`/users/avatar-vibe/${encodeURIComponent(pseudonym)}?localDate=${today}`)
      .then(res => {
        if (cancelled) return;
        if (res.data.emoji) {
          const result = { emoji: res.data.emoji, type: res.data.type };
          vibeCache[cacheKey] = result;
          setVibe(result);
          setTimeout(() => setOpacity(1), 50);
        } else {
          vibeCache[cacheKey] = null;
        }
      })
      .catch(() => { vibeCache[cacheKey] = null; });
    return () => { cancelled = true; };
  }, [pseudonym, today]);

  // Gentle float animation
  useEffect(() => {
    if (!vibe) return;
    let dir = -1;
    floatRef.current = setInterval(() => {
      setFloatY(y => { if (y <= -3) dir = 1; if (y >= 0) dir = -1; return y + dir * 0.1; });
    }, 30);
    return () => clearInterval(floatRef.current);
  }, [vibe]);

  if (!vibe) return null;

  const isMilestone = vibe.type === "milestone";
  const emojiSize   = isMilestone ? size + 2 : size;
  const badgeSize   = emojiSize + 6;

  return (
    <div style={{
      position: "absolute", top: -4, right: -4, zIndex: 10,
      opacity,
      transform: `translateY(${floatY}px)`,
      transition: "opacity 0.2s ease",
    }}>
      <div style={{
        width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2,
        backgroundColor: isMilestone ? "#FFD70033" : "rgba(0,0,0,0.45)",
        border: isMilestone ? "1px solid #FFD70099" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }}>
        <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{vibe.emoji}</span>
      </div>
    </div>
  );
}

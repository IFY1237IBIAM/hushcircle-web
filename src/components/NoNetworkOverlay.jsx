"use client";
// Matches mobile NoNetworkOverlay.js — context-specific offline modal
import { useEffect, useState } from "react";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", text:"#EDE8F5", textMuted:"#8B7FA8" };

const ACTION_CONFIG = {
  signup:        { icon: "📡", title: "No connection",             message: "You need internet to create your account." },
  login:         { icon: "📡", title: "No connection",             message: "You need internet to sign in." },
  feed:          { icon: "📶", title: "Can't load stories",        message: "Check your internet connection to see stories." },
  post:          { icon: "📡", title: "Can't share your post",     message: "Your words are saved — try again when connected." },
  comment:       { icon: "💬", title: "Can't send comment",        message: "You need internet to comment." },
  reply:         { icon: "↩️",  title: "Can't send reply",          message: "You need internet to reply." },
  reaction:      { icon: "💜", title: "Can't react",               message: "You need internet to react to posts." },
  profile:       { icon: "👤", title: "Can't load profile",        message: "You need internet to view this profile." },
  notifications: { icon: "🔔", title: "Can't load notifications",  message: "You need internet to see your notifications." },
  save:          { icon: "🏷️", title: "Can't save post",           message: "You need internet to save posts." },
  default:       { icon: "📡", title: "No connection",             message: "You need internet to do this." },
};

export default function NoNetworkOverlay({ visible, onClose, onRetry, action = "default" }) {
  const [scale,   setScale]   = useState(0.85);
  const [opacity, setOpacity] = useState(0);
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.default;

  useEffect(() => {
    if (visible) { setTimeout(() => { setScale(1); setOpacity(1); }, 10); }
    else { setScale(0.85); setOpacity(0); }
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}>
      <div style={{ backgroundColor: C.card, borderRadius: 28, padding: 28, width: "100%", maxWidth: 340, textAlign: "center", border: `1px solid ${C.border}`, opacity, transform: `scale(${scale})`, transition: "opacity 0.2s ease, transform 0.25s ease" }}>
        {/* Context icon */}
        <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: C.border, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 38 }}>
          {config.icon}
        </div>
        <h3 style={{ color: C.text, fontFamily: "DM Serif Display, Georgia, serif", fontSize: 24, margin: "0 0 10px" }}>{config.title}</h3>
        <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>{config.message}</p>

        {/* No-wifi badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: C.border, borderRadius: 10, padding: "7px 14px", marginBottom: 22, fontSize: 12, color: C.textMuted }}>
          📡 No internet · Check your connection
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          {onClose && (
            <button onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, backgroundColor: "transparent", color: C.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Dismiss
            </button>
          )}
          {onRetry && (
            <button onClick={onRetry} style={{ flex: 1, padding: 14, borderRadius: 14, border: "none", backgroundColor: C.accent, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              🔄 Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

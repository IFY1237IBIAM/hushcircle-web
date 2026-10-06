"use client";
// Matches mobile NetworkBanner.js — slides in from top on connectivity change
import { useEffect, useState } from "react";

export default function NetworkBanner() {
  const [isOnline,        setIsOnline]        = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const [visible,         setVisible]         = useState(false);
  const [slideY,          setSlideY]          = useState(-80);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true); setJustReconnected(true); setVisible(true);
      setTimeout(() => setSlideY(0), 10);
      setTimeout(() => { setSlideY(-80); setTimeout(() => { setVisible(false); setJustReconnected(false); }, 400); }, 3000);
    };
    const handleOffline = () => {
      setIsOnline(false); setJustReconnected(false); setVisible(true);
      setTimeout(() => setSlideY(0), 10);
    };
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  if (!visible) return null;

  const bgColor  = justReconnected ? "#4CAF8F" : "#D4607A";
  const title    = justReconnected ? "Back online!" : "No internet connection";
  const subtitle = justReconnected ? "Everything is working again" : "Check your connection to continue";

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, backgroundColor: bgColor, transform: `translateY(${slideY}px)`, transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)", padding: "48px 20px 14px", display: "flex", alignItems: "center", gap: 12, pointerEvents: "none" }}>
      <span style={{ fontSize: 22 }}>{justReconnected ? "✅" : "⚡"}</span>
      <div>
        <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0 }}>{title}</p>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, margin: 0 }}>{subtitle}</p>
      </div>
    </div>
  );
}

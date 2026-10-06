"use client";
import { useEffect, useState } from "react";

export default function IntroSplash({ onFinished }) {
  const [textOpacity, setTextOpacity] = useState(0);
  const [textX,       setTextX]       = useState(0);
  const [dot1,        setDot1]        = useState(0);
  const [dot2,        setDot2]        = useState(0);
  const [dot3,        setDot3]        = useState(0);
  const [bgOpacity,   setBgOpacity]   = useState(1);
  const [done,        setDone]        = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTextOpacity(1), 80);
    const t2 = setTimeout(() => setDot1(1), 800);
    const t3 = setTimeout(() => setDot2(1), 980);
    const t4 = setTimeout(() => setDot3(1), 1160);
    const t5 = setTimeout(() => { setTextX(110); setBgOpacity(0); }, 1950);
    const t6 = setTimeout(() => { setDone(true); if (onFinished) onFinished(); }, 2500);
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, []);

  if (done) return null;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "#0F0A1E", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, opacity: bgOpacity, transition: "opacity 0.5s ease", pointerEvents: bgOpacity < 0.1 ? "none" : "all" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: textOpacity, transform: `translateX(${textX}%)`, transition: textOpacity === 1 ? "opacity 0.7s ease, transform 0.5s ease" : "opacity 0.7s ease" }}>
        <h1 style={{ fontSize: 44, letterSpacing: -0.5, margin: "0 0 12px" }}>
          <span style={{ color: "#9B6FD4", fontFamily: "DM Serif Display, Georgia, serif" }}>Hush</span>
          <span style={{ color: "#EDE8F5", fontFamily: "DM Serif Display, Georgia, serif" }}>Circle</span>
          <span style={{ color: "#9B6FD4", fontFamily: "DM Serif Display, Georgia, serif", fontSize: 32 }}>.org</span>
        </h1>
        <p style={{ color: "#8B7FA8", fontSize: 14, letterSpacing: 0.3, margin: "0 0 32px", fontFamily: "Nunito, sans-serif" }}>A safe space for your heart</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[dot1, dot2, dot3].map((opacity, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#9B6FD4", opacity, transition: "opacity 0.3s ease" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

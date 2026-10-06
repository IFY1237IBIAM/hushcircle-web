"use client";
// Matches mobile HushCircleSpinner.js — animated HC spinner overlay
import { useEffect, useState } from "react";

export default function HushCircleSpinner({ visible, message = "" }) {
  const [dots, setDots] = useState([0.3, 0.3, 0.3]);
  const [spin, setSpin] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const spinInterval = setInterval(() => setSpin(s => s + 6), 16);
    const dotIntervals = [0, 200, 400].map((delay, i) =>
      setTimeout(() => {
        setInterval(() => {
          setDots(prev => {
            const next = [...prev];
            next[i] = next[i] > 0.6 ? 0.3 : 1;
            return next;
          });
        }, 800);
      }, delay)
    );
    return () => { clearInterval(spinInterval); dotIntervals.forEach(clearTimeout); };
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "#0F0A1E", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Spinning ring */}
        <div style={{ width: 100, height: 100, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#9B6FD4", borderRightColor: "#C4A3E844", transform: `rotate(${spin}deg)`, transition: "transform 0.016s linear" }} />
          <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "2px solid transparent", borderBottomColor: "#9B6FD466", borderLeftColor: "#C4A3E822", transform: `rotate(${-spin * 0.7}deg)`, transition: "transform 0.016s linear" }} />
          {/* HC logo */}
          <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#1A1330", border: "1.5px solid #9B6FD444", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#C4A3E8", fontSize: 22, fontFamily: "DM Serif Display, Georgia, serif", letterSpacing: 0.5 }}>HC</span>
          </div>
        </div>
        {/* Message */}
        {message && <p style={{ color: "#C4A3E8", fontSize: 14, fontFamily: "Nunito, sans-serif", letterSpacing: 0.3, margin: 0 }}>{message}</p>}
        {/* Dots */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {dots.map((opacity, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#9B6FD4", opacity }} />
          ))}
        </div>
      </div>
    </div>
  );
}

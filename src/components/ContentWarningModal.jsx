"use client";
// Matches mobile ContentWarningModal.js — shown once on first launch
import { useState, useEffect } from "react";

const SHOWN_KEY = "hushcircle_content_warning_shown_v1";
const C = { card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", text:"#EDE8F5", textMuted:"#8B7FA8", error:"#D4607A" };

export default function ContentWarningModal() {
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    try {
      const shown = localStorage.getItem(SHOWN_KEY);
      if (!shown) { setVisible(true); setTimeout(() => setOpacity(1), 50); }
    } catch {}
  }, []);

  const handleDismiss = () => {
    setOpacity(0);
    try { localStorage.setItem(SHOWN_KEY, "true"); } catch {}
    setTimeout(() => setVisible(false), 200);
  };

  if (!visible) return null;

  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9998, padding:24, opacity, transition:"opacity 0.3s ease" }}>
      <div style={{ backgroundColor:C.card, borderRadius:24, padding:28, width:"100%", maxWidth:380, border:`1px solid ${C.border}`, textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.5)" }}>

        {/* Icon */}
        <div style={{ width:72, height:72, borderRadius:36, backgroundColor:"rgba(155,111,212,0.15)", border:"1.5px solid rgba(155,111,212,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:32 }}>
          💜
        </div>

        <h2 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:24, margin:"0 0 14px" }}>Before you enter</h2>

        <p style={{ color:C.textMuted, fontSize:14, lineHeight:1.65, margin:"0 0 10px" }}>
          HushCircle is a safe space for people navigating difficult emotions — heartbreak, sadness, fear, and more.
        </p>
        <p style={{ color:C.textMuted, fontSize:14, lineHeight:1.65, margin:"0 0 16px" }}>
          Some posts may discuss sensitive mental health topics including depression, anxiety, and thoughts of self-harm.
        </p>

        {/* Crisis box */}
        <div style={{ backgroundColor:"rgba(212,96,122,0.1)", borderRadius:14, border:"1px solid rgba(212,96,122,0.3)", padding:16, marginBottom:20 }}>
          <p style={{ color:C.text, fontSize:14, fontWeight:700, margin:"0 0 6px" }}>🆘 If you're in crisis right now</p>
          <p style={{ color:C.textMuted, fontSize:13, lineHeight:1.55, margin:"0 0 10px" }}>Please reach out to a crisis helpline immediately. Help is available 24/7.</p>
          <a href="https://www.befrienders.org" target="_blank" rel="noreferrer"
            style={{ display:"inline-block", backgroundColor:"rgba(212,96,122,0.2)", border:"1px solid rgba(212,96,122,0.4)", borderRadius:10, padding:"8px 16px", color:C.error, fontSize:13, fontWeight:600, textDecoration:"none" }}>
            Find a crisis helpline near you →
          </a>
        </div>

        <button onClick={handleDismiss}
          style={{ width:"100%", backgroundColor:C.accent, color:"#fff", border:"none", borderRadius:14, padding:"14px 0", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:14 }}>
          I understand — enter safely 💜
        </button>

        <p style={{ color:"#4A4060", fontSize:12, margin:0 }}>HushCircle is intended for users aged 13 and older.</p>
      </div>
    </div>
  );
}

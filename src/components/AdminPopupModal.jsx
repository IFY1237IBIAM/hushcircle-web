"use client";
// Matches mobile AdminPopupModal.js — ban/warning/unban popup from admin
import { useState, useEffect } from "react";
import api from "../lib/api";

const C = { card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A", warning:"#D4A44C", bg:"#0F0A1E" };

export default function AdminPopupModal({ visible, popup, onDismiss }) {
  const [dismissing, setDismissing] = useState(false);
  const [opacity,    setOpacity]    = useState(0);
  const [scale,      setScale]      = useState(0.85);

  useEffect(() => {
    if (visible) { setTimeout(() => { setOpacity(1); setScale(1); }, 10); }
    else { setOpacity(0); setScale(0.85); }
  }, [visible]);

  if (!visible || !popup) return null;

  const isBan   = popup.isBanNotification;
  const isUnban = popup.isUnban;
  const accentColor = isUnban ? C.success : isBan ? C.error : C.warning;
  const emoji   = isUnban ? "💜" : isBan ? "🚫" : "⚠️";
  const title   = isUnban ? "Account Reinstated" : isBan ? "Account Suspended" : "Post Removed";
  const violationCount = popup.violationCount || 0;

  const handleDismiss = async () => {
    if (dismissing || !popup) return;
    setDismissing(true);
    try { await api.put(`/notifications/popup/${popup._id}/read`); } catch {}
    setOpacity(0); setScale(0.85);
    setTimeout(() => { setDismissing(false); onDismiss(); }, 200);
  };

  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.82)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:20 }}>
      <div style={{ backgroundColor:C.card, borderRadius:24, width:"100%", maxWidth:380, border:`1px solid ${accentColor}44`, overflow:"hidden", maxHeight:"90vh", overflowY:"auto", opacity, transform:`scale(${scale})`, transition:"opacity 0.25s ease, transform 0.25s ease", boxShadow:"0 12px 48px rgba(0,0,0,0.5)" }}>
        {/* Accent bar */}
        <div style={{ height:4, backgroundColor:accentColor }} />

        <div style={{ padding:24 }}>
          {/* Logo row */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:36, height:36, borderRadius:18, backgroundColor:C.bg, border:`1.5px solid ${accentColor}44`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:accentColor, fontSize:18, fontFamily:"DM Serif Display,Georgia,serif" }}>W</span>
            </div>
            <span style={{ color:C.textMuted, fontSize:13, fontWeight:600 }}>HushCircle Team</span>
          </div>

          {/* Emoji */}
          <div style={{ width:72, height:72, borderRadius:36, backgroundColor:accentColor+"18", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:36 }}>
            {emoji}
          </div>

          <h2 style={{ color:accentColor, fontFamily:"DM Serif Display,Georgia,serif", fontSize:26, textAlign:"center", margin:"0 0 10px" }}>{title}</h2>
          <p style={{ color:C.text, fontSize:15, textAlign:"center", lineHeight:1.65, margin:"0 0 16px" }}>{popup.adminMessage}</p>

          {popup.adminReason && (
            <div style={{ backgroundColor:C.bg, borderRadius:14, padding:14, border:`1px solid ${accentColor}33`, marginBottom:12 }}>
              <p style={{ color:accentColor, fontWeight:700, fontSize:12, margin:"0 0 6px" }}>📋 Reason</p>
              <p style={{ color:C.text, fontSize:14, lineHeight:1.6, margin:0 }}>{popup.adminReason}</p>
            </div>
          )}

          {popup.postPreview && (
            <div style={{ backgroundColor:C.bg, borderRadius:12, padding:12, borderLeft:`3px solid ${C.border}`, marginBottom:12 }}>
              <p style={{ color:C.textMuted, fontSize:11, fontWeight:600, margin:"0 0 4px" }}>Affected post</p>
              <p style={{ color:C.textMuted, fontSize:13, fontStyle:"italic", margin:0 }}>"{popup.postPreview.slice(0,120)}..."</p>
            </div>
          )}

          {/* Violation dots */}
          {!isBan && !isUnban && violationCount > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:8, backgroundColor:C.bg, borderRadius:12, padding:12, marginBottom:14 }}>
              {[1,2,3].map(n => (
                <div key={n} style={{ width:28, height:28, borderRadius:14, backgroundColor:n<=violationCount?(n===3?C.error:C.warning):C.border, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>{n}</span>
                </div>
              ))}
              <p style={{ color:C.textMuted, fontSize:12, margin:0, flex:1 }}>Violation {violationCount} of 3</p>
            </div>
          )}

          {popup.nextStep && (
            <div style={{ backgroundColor:accentColor+"0D", borderRadius:14, padding:14, marginBottom:12 }}>
              <p style={{ color:accentColor, fontWeight:700, fontSize:13, margin:"0 0 6px" }}>{isUnban?"💜 What happens now":"ℹ️ What happens next"}</p>
              <p style={{ color:C.textMuted, fontSize:13, lineHeight:1.6, margin:0 }}>{popup.nextStep}</p>
            </div>
          )}

          {!isUnban && (
            <div style={{ backgroundColor:C.bg, borderRadius:12, padding:12, marginBottom:4 }}>
              <p style={{ color:C.textMuted, fontSize:12, lineHeight:1.6, textAlign:"center", margin:0 }}>
                📖 Our community guidelines exist to keep HushCircle a safe healing space for everyone. Thank you for understanding.
              </p>
            </div>
          )}
        </div>

        {/* CTA button */}
        <button onClick={handleDismiss} disabled={dismissing}
          style={{ display:"block", width:"calc(100% - 32px)", margin:"4px 16px 16px", backgroundColor:accentColor, color:"#fff", border:"none", borderRadius:14, padding:16, fontSize:15, fontWeight:700, cursor:"pointer" }}>
          {isUnban ? "Welcome back 💜" : isBan ? "I understand" : "I'll follow the guidelines 💜"}
        </button>

        <p style={{ color:C.textMuted, fontSize:11, textAlign:"center", paddingBottom:16, opacity:0.7, margin:0 }}>
          This message is from the HushCircle moderation team
        </p>
      </div>
    </div>
  );
}

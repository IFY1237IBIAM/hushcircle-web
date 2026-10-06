"use client";
// Matches mobile UserProfileCard.js exactly
import { useState, useEffect } from "react";
import api from "../lib/api";
import OnlineDot from "./OnlineDot";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A", inputBg:"#0F0A1E" };
const AVATAR_COLORS = ["#9B6FD4","#D4607A","#6B9FD4","#4CAF8F","#D4A44C","#E879F9"];
const getAvatarColor = p => AVATAR_COLORS[(p?.charCodeAt(0)||0) % AVATAR_COLORS.length];

function formatLastSeen(lastSeen) {
  if (!lastSeen) return "a long time ago";
  const s = Math.floor((Date.now() - new Date(lastSeen)) / 1000);
  const m = Math.floor(s/60), h = Math.floor(s/3600), d = Math.floor(s/86400);
  if (s < 30) return "just now";
  if (s < 60) return `${s} seconds ago`;
  if (m < 60) return `${m} minute${m!==1?"s":""} ago`;
  if (h < 24) return `${h} hour${h!==1?"s":""} ago`;
  if (d < 7)  return `${d} day${d!==1?"s":""} ago`;
  return new Date(lastSeen).toLocaleDateString("en-US",{month:"long",year:"numeric"});
}

function formatCount(n) {
  if (!n) return "0";
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n/1000).toFixed(1)}k`;
  return `${Math.floor(n/1000)}k`;
}

export default function UserProfileCard({ pseudonym, visible, onClose }) {
  const [userData, setUserData] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [hasError, setHasError] = useState(false);
  const [scale,    setScale]    = useState(0.85);
  const [opacity,  setOpacity]  = useState(0);

  const avatarColor = getAvatarColor(pseudonym);

  const fetchUser = async () => {
    setLoading(true); setHasError(false);
    try { const res = await api.get(`/auth/user/${pseudonym}`); setUserData(res.data.user); }
    catch { setHasError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (visible && pseudonym) {
      setUserData(null); setHasError(false); fetchUser();
      setTimeout(() => { setScale(1); setOpacity(1); }, 10);
    } else {
      setScale(0.85); setOpacity(0);
    }
  }, [visible, pseudonym]);

  if (!visible) return null;

  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:24 }} onClick={onClose}>
      <div style={{ backgroundColor:C.card, borderRadius:24, padding:20, width:"100%", maxWidth:360, border:`1px solid ${C.border}`, opacity, transform:`scale(${scale})`, transition:"opacity 0.2s ease, transform 0.25s ease", boxShadow:"0 12px 48px rgba(0,0,0,0.5)" }} onClick={e=>e.stopPropagation()}>

        {loading ? (
          <div style={{ textAlign:"center", padding:24 }}>
            <div style={{ width:32, height:32, border:`2px solid ${C.accent}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 10px" }} />
            <p style={{ color:C.textMuted, fontSize:13, margin:0 }}>Loading profile...</p>
          </div>
        ) : hasError ? (
          <div style={{ textAlign:"center", padding:24 }}>
            <p style={{ fontSize:36, marginBottom:10 }}>😔</p>
            <p style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:18, marginBottom:8 }}>Could not load</p>
            <button onClick={fetchUser} style={{ backgroundColor:C.accent, color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontSize:13, cursor:"pointer" }}>Try again</button>
          </div>
        ) : userData ? (
          <>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:16 }}>
              <div style={{ position:"relative", flexShrink:0 }}>
                <div style={{ width:64, height:64, borderRadius:32, backgroundColor:avatarColor+"33", border:`2px solid ${avatarColor}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"DM Serif Display,Georgia,serif", fontSize:28, color:avatarColor }}>
                  {pseudonym?.[0]?.toUpperCase()}
                </div>
                {userData.showOnlineStatus && <OnlineDot isOnline={userData.isOnline} showOnlineStatus size={16} borderColor={C.card} />}
              </div>

              <div style={{ flex:1 }}>
                <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, margin:"0 0 5px" }}>{userData.pseudonym}</h3>
                {userData.showOnlineStatus ? (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", backgroundColor:userData.isOnline?C.success:C.error }} />
                    <span style={{ color:userData.isOnline?C.success:C.textMuted, fontSize:13 }}>{userData.isOnline?"Online now":`Last seen ${formatLastSeen(userData.lastSeen)}`}</span>
                  </div>
                ) : (
                  <p style={{ color:C.textMuted, fontSize:13, margin:"0 0 5px" }}>🔒 Online status hidden</p>
                )}
                {userData.joinedAt && <p style={{ color:C.textMuted, fontSize:11, margin:0 }}>📅 Joined {new Date(userData.joinedAt).toLocaleDateString("en-US",{month:"long",year:"numeric"})}</p>}
              </div>

              <button onClick={onClose} style={{ width:28, height:28, borderRadius:14, backgroundColor:C.inputBg, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:C.textMuted, flexShrink:0 }}>×</button>
            </div>

            <div style={{ height:1, backgroundColor:C.border, margin:"0 0 14px" }} />

            {/* Stats */}
            <div style={{ display:"flex", justifyContent:"space-around", alignItems:"center", marginBottom:14 }}>
              <div style={{ textAlign:"center" }}>
                <p style={{ color:C.accent, fontFamily:"DM Serif Display,Georgia,serif", fontSize:28, margin:"0 0 2px" }}>{formatCount(userData.totalPosts)}</p>
                <p style={{ color:C.textMuted, fontSize:12, margin:0 }}>Stories</p>
              </div>
              <div style={{ width:1, height:40, backgroundColor:C.border }} />
              <div style={{ textAlign:"center" }}>
                <p style={{ color:"#D4607A", fontFamily:"DM Serif Display,Georgia,serif", fontSize:28, margin:"0 0 2px" }}>{formatCount(userData.totalReactions)}</p>
                <p style={{ color:C.textMuted, fontSize:12, margin:0 }}>Hearts received</p>
              </div>
            </div>

            <div style={{ height:1, backgroundColor:C.border, margin:"0 0 14px" }} />

            {/* Anon note */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:8, backgroundColor:C.inputBg, borderRadius:12, padding:12, marginBottom:12 }}>
              <span style={{ fontSize:14 }}>🛡️</span>
              <p style={{ color:C.textMuted, fontSize:12, lineHeight:1.6, margin:0 }}>This is an anonymous identity. No personal information is shared on HushCircle.</p>
            </div>

            {/* Active status */}
            {userData.showOnlineStatus ? (
              <div style={{ display:"flex", alignItems:"center", gap:10, borderRadius:12, padding:12, border:`1px solid ${userData.isOnline?C.success+"44":C.border}`, backgroundColor:C.inputBg }}>
                <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor:userData.isOnline?C.success:C.error, flexShrink:0 }} />
                <p style={{ color:userData.isOnline?C.success:C.textMuted, fontSize:13, margin:0 }}>
                  {userData.isOnline ? "Currently active on HushCircle" : userData.lastSeen ? `Was active ${formatLastSeen(userData.lastSeen)}` : "Has not been active recently"}
                </p>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:10, borderRadius:12, padding:12, border:`1px solid ${C.border}`, backgroundColor:C.inputBg }}>
                <span>🔒</span>
                <p style={{ color:C.textMuted, fontSize:13, margin:0 }}>This user has hidden their online status</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

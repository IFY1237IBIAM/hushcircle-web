"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import Navbar from "../../../components/Navbar";
import PostCard from "../../../components/PostCard";
import NoNetworkOverlay from "../../../components/NoNetworkOverlay";
import OnlineDot from "../../../components/OnlineDot";
import { BlockIcon, BackIcon, ShieldIcon, ReportIcon } from "../../../components/Icons";
import { formatCount } from "../../../components/CommentThread";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A", inputBg:"#0F0A1E" };
const AVATAR_COLORS = ["#9B6FD4","#D4607A","#6B9FD4","#4CAF8F","#D4A44C","#E879F9"];
const avatarColor = p => AVATAR_COLORS[(p?.charCodeAt(0)||0)%AVATAR_COLORS.length];
const REPORT_REASONS = ["Harassment","Bullying","Spam","Inappropriate content","Other"];

function formatLastSeen(d) {
  if (!d) return "a while ago";
  const s = Math.floor((Date.now()-new Date(d))/1000);
  if (s<60) return "just now";
  if (s<3600) return `${Math.floor(s/60)}m ago`;
  if (s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function UserProfilePage() {
  const router = useRouter(); const params = useParams();
  const { user, loading } = useAuth();
  const pseudonym = params?.pseudonym;

  const [profile,       setProfile]       = useState(null);
  const [posts,         setPosts]         = useState([]);
  const [fetching,      setFetching]      = useState(true);
  const [showNoNetwork, setShowNoNetwork] = useState(false);
  const [blocking,      setBlocking]      = useState(false);
  const [showReport,    setShowReport]    = useState(false);
  const [reportReason,  setReportReason]  = useState(null);
  const [reportDetails, setReportDetails] = useState("");
  const [reporting,     setReporting]     = useState(false);
  const [reportDone,    setReportDone]    = useState(false);

  useEffect(() => { if (!loading&&!user) router.push("/login"); }, [user,loading]);
  useEffect(() => { if (user&&pseudonym) load(); }, [user,pseudonym]);

  const load = async () => {
    setFetching(true);
    try {
      const [pr,postr] = await Promise.all([
        api.get(`/auth/user/${pseudonym}`).catch(()=>({data:{user:null}})),
        api.get(`/posts/search?q=${encodeURIComponent(pseudonym)}&author=${encodeURIComponent(pseudonym)}`).catch(()=>({data:{posts:[]}})),
      ]);
      setProfile(pr.data.user); setPosts(postr.data.posts||[]);
      setShowNoNetwork(false);
    } catch (e) { if (e.message==="Network Error") setShowNoNetwork(true); }
    finally { setFetching(false); }
  };

  const handleBlock = async () => {
    if (!profile||!confirm(`Block @${pseudonym}? Their posts will be hidden from your feed.`)) return;
    setBlocking(true);
    try { await api.post(`/settings/block/${profile._id}`); alert(`@${pseudonym} has been blocked.`); router.back(); }
    catch (e) { alert(e.response?.data?.message||"Could not block user."); }
    finally { setBlocking(false); }
  };

  const handleReport = async () => {
    if (!reportReason||reporting) return;
    setReporting(true);
    try {
      await api.post(`/auth/user/${pseudonym}/report`,{ reason:reportReason, details:reportDetails });
      setReportDone(true);
    } catch { alert("Could not submit report."); }
    finally { setReporting(false); }
  };

  const isOwn = user?.pseudonym===pseudonym;
  const color  = avatarColor(pseudonym);
  const isOnline = profile?.isOnline && profile?.showOnlineStatus && (Date.now()-new Date(profile?.lastSeen))/1000 < 3*60;

  if (loading||!user) return null;

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, paddingTop:56, paddingBottom:80 }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>

        {/* Back */}
        <button onClick={()=>router.back()} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:C.accent, fontSize:14, fontWeight:600, cursor:"pointer", padding:"16px 0 8px" }}>
          <BackIcon size={18} color={C.accent} /> Back
        </button>

        {fetching ? <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>
        : !profile ? (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <p style={{ fontSize:44, marginBottom:12 }}>👤</p>
            <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, marginBottom:8 }}>User not found</h3>
            <p style={{ color:C.textMuted, fontSize:14 }}>This profile may no longer exist.</p>
          </div>
        ) : (
          <>
            {/* Profile card */}
            <div style={{ backgroundColor:C.card, borderRadius:24, padding:24, marginBottom:20, border:`1px solid ${C.border}`, textAlign:"center" }}>
              {/* Avatar */}
              <div style={{ position:"relative", width:80, height:80, margin:"0 auto 14px" }}>
                <div style={{ width:80, height:80, borderRadius:40, backgroundColor:color+"22", border:`2.5px solid ${color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:32, color, fontFamily:"DM Serif Display,Georgia,serif" }}>
                  {pseudonym?.[0]?.toUpperCase()}
                </div>
                <OnlineDot isOnline={profile.isOnline} showOnlineStatus={profile.showOnlineStatus} size={18} borderColor={C.bg} />
              </div>

              <h2 style={{ color:C.text, fontWeight:700, fontSize:22, margin:"0 0 6px" }}>@{pseudonym}</h2>

              {/* Online status */}
              {profile.showOnlineStatus ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:10 }}>
                  <div style={{ width:8, height:8, borderRadius:4, backgroundColor:isOnline?C.success:C.textMuted }} />
                  <span style={{ color:isOnline?C.success:C.textMuted, fontSize:13 }}>
                    {isOnline ? "Online now" : `Last seen ${formatLastSeen(profile.lastSeen)}`}
                  </span>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:10 }}>
                  <ShieldIcon size={13} color={C.textMuted} />
                  <span style={{ color:C.textMuted, fontSize:13 }}>Online status hidden</span>
                </div>
              )}

              {profile.bio && <p style={{ color:C.textMuted, fontSize:14, lineHeight:1.6, margin:"0 0 16px" }}>{profile.bio}</p>}

              {/* Stats */}
              <div style={{ display:"flex", justifyContent:"space-around", paddingTop:16, borderTop:`1px solid ${C.border}` }}>
                {[{num:formatCount(profile.totalPosts??0), label:"Posts"}, {num:formatCount(profile.totalReactions??0), label:"Hearts"}].map((s,i)=>(
                  <div key={i} style={{ textAlign:"center", flex:1 }}>
                    <p style={{ color:C.accent, fontFamily:"DM Serif Display,Georgia,serif", fontSize:26, margin:0 }}>{s.num}</p>
                    <p style={{ color:C.textMuted, fontSize:12, margin:0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Anon note */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:8, backgroundColor:C.card, borderRadius:14, padding:14, border:`1px solid ${C.border}`, marginBottom:16 }}>
              <ShieldIcon size={14} color={C.textMuted} />
              <p style={{ color:C.textMuted, fontSize:12, lineHeight:1.6, margin:0 }}>This is an anonymous identity. HushCircle never shares personal information.</p>
            </div>

            {/* Actions */}
            {!isOwn && (
              <div style={{ display:"flex", gap:10, marginBottom:24 }}>
                <button onClick={()=>setShowReport(true)} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:12, borderRadius:12, border:`1px solid ${C.warning}44`, backgroundColor:C.warning+"11", color:C.warning, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  <ReportIcon size={15} color={C.warning} /> Report
                </button>
                <button onClick={handleBlock} disabled={blocking} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:12, borderRadius:12, border:`1px solid ${C.error}44`, backgroundColor:C.error+"11", color:C.error, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  <BlockIcon size={15} color={C.error} /> {blocking?"Blocking...":"Block"}
                </button>
              </div>
            )}

            {/* Posts */}
            {posts.length>0 && (
              <>
                <p style={{ color:C.textMuted, fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:0.6, marginBottom:12 }}>Posts by @{pseudonym}</p>
                {posts.map(post=>(
                  <PostCard key={post._id} post={post}
                    onDeleted={id=>setPosts(p=>p.filter(x=>x._id!==id))}
                    onHidden={id=>setPosts(p=>p.filter(x=>x._id!==id))}
                    onEdited={(id,content,mood)=>setPosts(p=>p.map(x=>x._id===id?{...x,content,mood}:x))}
                  />
                ))}
              </>
            )}
          </>
        )}
      </main>

      {/* Report sheet */}
      {showReport && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50 }}>
          <div style={{ backgroundColor:C.card, borderRadius:"24px 24px 0 0", padding:"24px 20px 40px", width:"100%", maxWidth:680, border:`1px solid ${C.border}`, borderBottom:"none" }}>
            <div style={{ width:40, height:4, borderRadius:2, backgroundColor:C.border, margin:"0 auto 16px" }} />
            {reportDone ? (
              <div style={{ textAlign:"center", padding:"16px 0" }}>
                <p style={{ fontSize:44, marginBottom:12 }}>✅</p>
                <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, marginBottom:8 }}>Report submitted</h3>
                <p style={{ color:C.textMuted, fontSize:14, marginBottom:20 }}>Thank you for keeping HushCircle safe 💜</p>
                <button onClick={()=>{setShowReport(false);setReportDone(false);setReportReason(null);}} style={{ width:"100%", padding:14, borderRadius:14, backgroundColor:C.accent, border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Close</button>
              </div>
            ) : (
              <>
                <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, margin:"0 0 4px" }}>Report @{pseudonym}</h3>
                <p style={{ color:C.textMuted, fontSize:13, margin:"0 0 16px" }}>What's the reason for this report?</p>
                {REPORT_REASONS.map(r=>(
                  <button key={r} onClick={()=>setReportReason(r)}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:12, border:`1px solid ${reportReason===r?C.accent:C.border}`, backgroundColor:reportReason===r?C.accent+"11":C.inputBg, color:C.text, fontSize:14, cursor:"pointer", textAlign:"left", marginBottom:6 }}>
                    {r}
                  </button>
                ))}
                <textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} placeholder="Additional details (optional)..." maxLength={200} rows={2}
                  style={{ width:"100%", backgroundColor:C.inputBg, borderRadius:10, border:`1px solid ${C.border}`, padding:"10px 12px", color:C.text, fontSize:13, resize:"none", outline:"none", fontFamily:"inherit", marginTop:8, marginBottom:14, boxSizing:"border-box" }} />
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setShowReport(false)} style={{ flex:1, padding:14, borderRadius:14, border:`1px solid ${C.border}`, backgroundColor:"transparent", color:C.textMuted, fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
                  <button onClick={handleReport} disabled={!reportReason||reporting} style={{ flex:1, padding:14, borderRadius:14, backgroundColor:C.error, border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", opacity:!reportReason?0.4:1 }}>{reporting?"Submitting...":"Submit"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <NoNetworkOverlay visible={showNoNetwork} action="profile" onClose={()=>setShowNoNetwork(false)} onRetry={()=>{setShowNoNetwork(false);load();}} />
    </div>
  );
}
function Spinner() { return <div style={{ width:28, height:28, border:"2px solid #9B6FD4", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />; }

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import HushCircleSpinner from "../../components/HushCircleSpinner";
import Navbar from "../../components/Navbar";
import PostCard from "../../components/PostCard";
import NoNetworkOverlay from "../../components/NoNetworkOverlay";
import OnlineDot from "../../components/OnlineDot";
import { SettingsIcon, PencilIcon, LockIcon, EyeIcon, EyeOffIcon, ShieldIcon } from "../../components/Icons";
import { formatCount } from "../../components/CommentThread";

// Inline SVG icons matching mobile exactly
const GridIcon2     = ({ size=14, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>);
const BookmarkIcon2 = ({ size=44, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>);
const FileEditIcon  = ({ size=44, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><path d="M12 18v-4M10 16h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" /></svg>);
const HeartIconLg   = ({ size=14, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>);
const MessageIcon   = ({ size=14, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>);

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A", warning:"#D4A44C", inputBg:"#0F0A1E" };
const AVATAR_COLORS = ["#9B6FD4","#D4607A","#6B9FD4","#4CAF8F","#D4A44C","#E879F9"];
const avatarColor = p => AVATAR_COLORS[(p?.charCodeAt(0)||0)%AVATAR_COLORS.length];

const TABS = [
  { key:"posts",  label:"Posts",  Icon:GridIcon2 },
  { key:"saved",  label:"Saved",  Icon:BookmarkIcon2 },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const [activeTab,       setActiveTab]       = useState("posts");
  const [stats,           setStats]           = useState(null);
  const [myPosts,         setMyPosts]         = useState([]);
  const [savedPosts,      setSavedPosts]      = useState([]);
  const [fetching,        setFetching]        = useState(true);
  const [showNoNetwork,   setShowNoNetwork]   = useState(false);
  const [showBioModal,    setShowBioModal]    = useState(false);
  const [bioText,         setBioText]         = useState("");
  const [savingBio,       setSavingBio]       = useState(false);
  const [togglingStatus,  setTogglingStatus]  = useState(false);
  const [showOnlineStatus,setShowOnlineStatus]= useState(true);

  useEffect(() => { if (!user) router.push("/login"); else { setBioText(user.bio||""); setShowOnlineStatus(user.showOnlineStatus!==false); fetchAll(); } }, [user]);

  const fetchAll = async () => {
    setFetching(true);
    try {
      const [sr,pr,saved] = await Promise.all([
        api.get("/auth/stats").catch(()=>({data:{}})),
        api.get("/auth/my-posts").catch(()=>({data:{posts:[]}})),
        api.get("/auth/saved-posts").catch(()=>({data:{posts:[]}})),
      ]);
      setStats(sr.data); setMyPosts(pr.data.posts||[]); setSavedPosts(saved.data.posts||[]);
      setShowNoNetwork(false);
    } catch (e) { if (e.message==="Network Error") setShowNoNetwork(true); }
    finally { setFetching(false); }
  };

  const handleBioSave = async () => {
    setSavingBio(true);
    try {
      await api.put("/auth/bio",{ bio:bioText.trim() });
      updateUser({ bio:bioText.trim() }); setShowBioModal(false);
    } catch { alert("Could not update bio."); }
    finally { setSavingBio(false); }
  };

  const handleToggleOnlineStatus = async () => {
    if (togglingStatus) return;
    setTogglingStatus(true);
    const next = !showOnlineStatus;
    setShowOnlineStatus(next);
    try { await api.put("/auth/online-status-privacy"); updateUser({ showOnlineStatus:next }); }
    catch { setShowOnlineStatus(!next); }
    finally { setTogglingStatus(false); }
  };

  if (!user) return null;
  const color = avatarColor(user.pseudonym);

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, paddingTop:56, paddingBottom:80 }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>

        {/* Profile header */}
        <div style={{ paddingTop:32, paddingBottom:24, borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:20 }}>
            {/* Avatar */}
            <div style={{ position:"relative" }}>
              <div style={{ width:80, height:80, borderRadius:40, backgroundColor:color+"22", border:`2.5px solid ${color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:700, color, fontFamily:"DM Serif Display,Georgia,serif" }}>
                {user.pseudonym?.[0]?.toUpperCase()}
              </div>
              <OnlineDot isOnline={true} showOnlineStatus={showOnlineStatus} size={18} borderColor={C.bg} />
            </div>

            {/* Info */}
            <div style={{ flex:1 }}>
              <h2 style={{ color:C.text, fontWeight:700, fontSize:22, margin:"0 0 4px" }}>@{user.pseudonym}</h2>
              <p style={{ color:C.textMuted, fontSize:13, margin:"0 0 10px" }}>{user.email}</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {user.isVerified
                  ? <Badge icon={<ShieldIcon size={11} color={C.success} />} label="Verified" color={C.success} />
                  : <Badge label="Not verified" color={C.warning} />
                }
                {user.isProfilePrivate && <Badge icon={<LockIcon size={11} color={C.textMuted} />} label="Private" color={C.textMuted} />}
              </div>
            </div>

            {/* Settings btn */}
            <button onClick={()=>router.push("/settings")} style={{ width:36, height:36, borderRadius:18, backgroundColor:C.inputBg, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <SettingsIcon size={18} color={C.textMuted} />
            </button>
          </div>

          {/* Bio */}
          <div style={{ backgroundColor:C.inputBg, borderRadius:14, padding:14, border:`1px solid ${C.border}`, marginBottom:14, cursor:"pointer" }} onClick={()=>setShowBioModal(true)}>
            {user.bio ? (
              <p style={{ color:C.text, fontSize:14, lineHeight:1.6, margin:0 }}>{user.bio}</p>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <PencilIcon size={13} color={C.textMuted} />
                <p style={{ color:C.textMuted, fontSize:14, fontStyle:"italic", margin:0 }}>Add a bio to tell your story...</p>
              </div>
            )}
          </div>

          {/* Online status toggle */}
          <button onClick={handleToggleOnlineStatus} disabled={togglingStatus}
            style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"12px 14px", borderRadius:14, border:`1px solid ${C.border}`, backgroundColor:C.inputBg, cursor:"pointer" }}>
            {showOnlineStatus ? <EyeIcon size={16} color={C.success} /> : <EyeOffIcon size={16} color={C.textMuted} />}
            <div style={{ flex:1, textAlign:"left" }}>
              <p style={{ color:showOnlineStatus?C.success:C.textMuted, fontWeight:700, fontSize:13, margin:0 }}>{showOnlineStatus?"Online status visible":"Online status hidden"}</p>
              <p style={{ color:C.textMuted, fontSize:11, margin:0 }}>{showOnlineStatus?"Others can see when you're active":"Your activity is private"}</p>
            </div>
            <div style={{ width:40, height:22, borderRadius:11, backgroundColor:showOnlineStatus?C.success+"44":C.border, position:"relative", transition:"background 0.2s" }}>
              <div style={{ width:18, height:18, borderRadius:9, backgroundColor:showOnlineStatus?C.success:C.textMuted, position:"absolute", top:2, left:showOnlineStatus?20:2, transition:"left 0.2s" }} />
            </div>
          </button>

          {/* Stats row */}
          {stats && (
            <div style={{ display:"flex", gap:0, marginTop:16, backgroundColor:C.inputBg, borderRadius:14, border:`1px solid ${C.border}`, overflow:"hidden" }}>
              {[
                { num:formatCount(stats.totalPosts||0),     label:"Posts",     icon:<GridIcon2 size={13} color={C.accent} /> },
                { num:formatCount(stats.totalReactions||0), label:"Hearts",    icon:<HeartIconLg size={13} color="#D4607A" /> },
                { num:formatCount(stats.totalComments||0),  label:"Comments",  icon:<MessageIcon size={13} color="#6B9FD4" /> },
              ].map((s,i)=>(
                <div key={s.label} style={{ flex:1, textAlign:"center", padding:"12px 8px", borderRight:i<2?`1px solid ${C.border}`:undefined }}>
                  <p style={{ color:C.accent, fontFamily:"DM Serif Display,Georgia,serif", fontSize:24, margin:"0 0 2px" }}>{s.num}</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                    {s.icon}
                    <p style={{ color:C.textMuted, fontSize:11, margin:0 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, marginBottom:16 }}>
          {TABS.map(tab=>{
            const TIcon = tab.Icon;
            const active = activeTab===tab.key;
            return (
              <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
                style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"14px 0", backgroundColor:"transparent", border:"none", borderBottom:`2px solid ${active?C.accent:"transparent"}`, color:active?C.accent:C.textMuted, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                <TIcon size={14} color={active?C.accent:C.textMuted} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {fetching ? (
          <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>
        ) : (
          <>
            {activeTab==="posts" && (
              myPosts.length===0 ? (
                <EmptyState icon={<FileEditIcon size={52} color={C.textMuted} />} title="No posts yet" sub="Share how you're feeling to see your posts here." />
              ) : myPosts.map(post=>(
                <PostCard key={post._id} post={post}
                  onDeleted={id=>setMyPosts(p=>p.filter(x=>x._id!==id))}
                  onEdited={(id,content,mood)=>setMyPosts(p=>p.map(x=>x._id===id?{...x,content,mood}:x))}
                />
              ))
            )}
            {activeTab==="saved" && (
              savedPosts.length===0 ? (
                <EmptyState icon={<BookmarkIcon2 size={52} color={C.textMuted} />} title="No saved posts" sub="Save posts to read them later." />
              ) : savedPosts.map(post=>(
                <PostCard key={post._id} post={post} onDeleted={id=>setSavedPosts(p=>p.filter(x=>x._id!==id))} />
              ))
            )}
          </>
        )}
      </main>

      {/* Bio modal */}
      {showBioModal && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50 }}>
          <div style={{ backgroundColor:C.card, borderRadius:"24px 24px 0 0", padding:"24px 24px 40px", width:"100%", maxWidth:680, border:`1px solid ${C.border}`, borderBottom:"none" }}>
            <div style={{ width:40, height:4, borderRadius:2, backgroundColor:C.border, margin:"0 auto 16px" }} />
            <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, margin:"0 0 4px" }}>Edit bio</h3>
            <p style={{ color:C.textMuted, fontSize:13, margin:"0 0 16px" }}>Share a little about yourself, anonymously.</p>
            <textarea value={bioText} onChange={e=>setBioText(e.target.value)} placeholder="Share your story..." maxLength={100} rows={3} autoFocus
              style={{ width:"100%", backgroundColor:C.inputBg, borderRadius:14, border:`1px solid ${C.accent}55`, padding:"12px 14px", color:C.text, fontSize:15, resize:"none", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
            <p style={{ color:C.textMuted, fontSize:11, textAlign:"right", margin:"4px 0 16px" }}>{bioText.length}/100</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowBioModal(false)} style={{ flex:1, padding:14, borderRadius:14, border:`1px solid ${C.border}`, backgroundColor:"transparent", color:C.textMuted, fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleBioSave} disabled={savingBio} style={{ flex:1, padding:14, borderRadius:14, backgroundColor:C.accent, border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>{savingBio?"Saving...":"Save bio 💜"}</button>
            </div>
          </div>
        </div>
      )}

      <NoNetworkOverlay visible={showNoNetwork} action="profile" onClose={()=>setShowNoNetwork(false)} onRetry={()=>{setShowNoNetwork(false);fetchAll();}} />
    </div>
  );
}

function Badge({ icon, label, color }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:4, backgroundColor:color+"22", borderRadius:10, padding:"3px 8px", border:`1px solid ${color}44` }}>
      {icon}<span style={{ color, fontSize:11, fontWeight:600 }}>{label}</span>
    </div>
  );
}
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign:"center", paddingTop:48 }}>
      <div style={{ width:90, height:90, borderRadius:45, backgroundColor:"#1A1330", border:"1px solid #2D2450", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>{icon}</div>
      <h3 style={{ color:"#EDE8F5", fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, marginBottom:8 }}>{title}</h3>
      <p style={{ color:"#8B7FA8", fontSize:14 }}>{sub}</p>
    </div>
  );
}
function Spinner() { return <div style={{ width:28, height:28, border:"2px solid #9B6FD4", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />; }
function GridIcon({ size, color }) { return <GridIcon2 size={size} color={color} />; }
function HeartIcon({ size, color }) { return <HeartIconLg size={size} color={color} />; }
function BookmarkIcon({ size, color }) { return <BookmarkIcon2 size={size} color={color} />; }

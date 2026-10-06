"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import NoNetworkOverlay from "../../components/NoNetworkOverlay";
import HushCircleSpinner from "../../components/HushCircleSpinner";
import { PlusIcon, UsersIcon, CheckIcon, LockIcon } from "../../components/Icons";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A", warning:"#D4A44C", inputBg:"#0F0A1E" };

const TOPIC_COLORS = { "Anxiety":"#6B9FD4","Heartbreak":"#D4607A","Depression":"#7B8FD4","Grief":"#9B6FD4","Self-love":"#4CAF8F","Addiction":"#D4A44C","Trauma":"#E879F9","Hope":"#4CAF8F" };
const TOPIC_OPTIONS = ["Anxiety","Heartbreak","Depression","Grief","Self-love","Addiction","Trauma","Hope","Other"];
const ICON_OPTIONS  = ["💜","🌿","💔","🌙","🔥","🌊","🕊️","🌸","⭐","🤗","🧠","💪","🌈","🫂"];
const CIRCLE_KEEPER_EMAIL = "mom@gmail.com";

export default function GroupsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [groups,          setGroups]          = useState([]);
  const [fetching,        setFetching]        = useState(true);
  const [showNoNetwork,   setShowNoNetwork]   = useState(false);
  const [showCreate,      setShowCreate]      = useState(false);
  const [creating,        setCreating]        = useState(false);
  const [spinnerMsg,      setSpinnerMsg]      = useState("");
  const [showSpinner,     setShowSpinner]     = useState(false);
  const [newGroup,        setNewGroup]        = useState({ name:"", topic:"", description:"", icon:"💜" });

  const isAdmin = user?.email === CIRCLE_KEEPER_EMAIL || user?.role === "admin";

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading]);
  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setFetching(true);
    try {
      const res = await api.get("/groups");
      const unique = (res.data.groups||[]).filter((g,i,a)=>a.findIndex(x=>x._id===g._id)===i);
      setGroups(unique); setShowNoNetwork(false);
    } catch (e) { if (e.message==="Network Error") setShowNoNetwork(true); }
    finally { setFetching(false); }
  };

  const handleJoin = async (group) => {
    if (group.rejoinBlockedUntil && new Date(group.rejoinBlockedUntil) > new Date()) {
      const remaining = Math.ceil((new Date(group.rejoinBlockedUntil)-new Date())/(1000*60*60));
      alert(`You left this circle recently. You can rejoin in ${remaining} hour${remaining!==1?"s":""}.`); return;
    }
    setSpinnerMsg(`Joining ${group.name}...`); setShowSpinner(true);
    try {
      await api.post(`/groups/join/${group._id}`);
      setGroups(prev=>prev.map(g=>g._id===group._id?{...g,isMember:true,memberCount:g.memberCount+1,rejoinBlockedUntil:null}:g));
    } catch (e) { alert(e.response?.data?.message||"Could not join group."); }
    finally { setShowSpinner(false); }
  };

  const handleLeave = async (group) => {
    if (!confirm(`Leave ${group.name}? You'll need to wait 24 hours before rejoining.`)) return;
    setSpinnerMsg("Leaving..."); setShowSpinner(true);
    try {
      await api.post(`/groups/leave/${group._id}`);
      const unblockAt = new Date(Date.now()+24*60*60*1000);
      setGroups(prev=>prev.map(g=>g._id===group._id?{...g,isMember:false,memberCount:g.memberCount-1,rejoinBlockedUntil:unblockAt,unreadCount:0}:g));
    } catch { alert("Could not leave group."); }
    finally { setShowSpinner(false); }
  };

  const handleOpen = async (group) => {
    setGroups(prev=>prev.map(g=>g._id===group._id?{...g,unreadCount:0}:g));
    try { await api.post(`/groups/${group._id}/mark-read`); } catch {}
    router.push(`/groups/${group._id}`);
  };

  const handleCreate = async () => {
    if (!newGroup.name.trim()) { alert("Please enter a circle name."); return; }
    if (!newGroup.topic) { alert("Please select a topic."); return; }
    setCreating(true);
    try {
      const res = await api.post("/groups",{ name:newGroup.name.trim(), topic:newGroup.topic, description:newGroup.description.trim(), icon:newGroup.icon });
      const created = res.data.group;
      setGroups(prev=>[{...created,isMember:true,memberCount:1,isFull:false,unreadCount:0},...prev]);
      setNewGroup({name:"",topic:"",description:"",icon:"💜"}); setShowCreate(false);
    } catch (e) { alert(e.response?.data?.message||"Could not create circle."); }
    finally { setCreating(false); }
  };

  if (loading||!user) return null;

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, paddingTop:56, paddingBottom:80 }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"16px 16px 0" }}>

        {/* Header */}
        <div style={{ paddingTop:16, paddingBottom:16, borderBottom:`1px solid ${C.border}`, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <h1 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:32, margin:0 }}>Circles</h1>
            <p style={{ color:C.textMuted, fontSize:13, margin:"4px 0 0" }}>Safe spaces built around shared experiences 💜</p>
          </div>
          {isAdmin && (
            <button onClick={()=>setShowCreate(true)} style={{ display:"flex", alignItems:"center", gap:6, backgroundColor:C.accent, color:"#fff", border:"none", borderRadius:12, padding:"8px 14px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              <PlusIcon size={14} color="#fff" /> New
            </button>
          )}
        </div>

        {/* Groups list */}
        {fetching ? (
          <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>
        ) : groups.length===0 ? (
          <div style={{ textAlign:"center", paddingTop:80 }}>
            <p style={{ fontSize:48, marginBottom:14 }}>💜</p>
            <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, marginBottom:8 }}>No circles yet</h3>
            <p style={{ color:C.textMuted, fontSize:14 }}>{isAdmin?"Tap '+ New' to create your first circle.":"Support groups are coming soon."}</p>
          </div>
        ) : groups.map(group=>{
          const topicColor = TOPIC_COLORS[group.topic]||C.accent;
          const isBlocked  = !!group.rejoinBlockedUntil && new Date(group.rejoinBlockedUntil)>new Date();
          const hasUnread  = group.isMember && group.unreadCount>0;
          return (
            <div key={group._id} style={{ backgroundColor:hasUnread?C.accent+"06":C.card, borderRadius:18, padding:16, marginBottom:12, border:`1px solid ${hasUnread?C.accent+"55":group.isMember?topicColor+"55":C.border}` }}>
              {/* Top row */}
              <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:10 }}>
                <div style={{ position:"relative" }}>
                  <div style={{ width:48, height:48, borderRadius:14, backgroundColor:topicColor+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
                    {group.icon}
                  </div>
                  {hasUnread && <div style={{ position:"absolute", top:-3, right:-3, width:14, height:14, borderRadius:7, backgroundColor:topicColor, border:`2px solid ${C.card}` }} />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                    <span style={{ color:C.text, fontWeight:700, fontSize:16 }}>{group.name}</span>
                    {hasUnread && (
                      <span style={{ backgroundColor:C.accent, color:"#fff", borderRadius:12, padding:"2px 8px", fontSize:11, fontWeight:700 }}>
                        {group.unreadCount>99?"99+":group.unreadCount}
                      </span>
                    )}
                  </div>
                  <span style={{ backgroundColor:topicColor+"22", color:topicColor, borderRadius:10, padding:"3px 8px", fontSize:11, fontWeight:600 }}>{group.topic}</span>
                </div>
                {group.isMember && (
                  <div style={{ display:"flex", alignItems:"center", gap:4, backgroundColor:C.success+"22", borderRadius:10, padding:"4px 8px", border:`1px solid ${C.success}44` }}>
                    <CheckIcon size={11} color={C.success} />
                    <span style={{ color:C.success, fontSize:11, fontWeight:700 }}>Joined</span>
                  </div>
                )}
              </div>

              {group.description && <p style={{ color:C.textMuted, fontSize:13, lineHeight:1.55, marginBottom:12 }}>{group.description}</p>}

              {/* Footer */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <UsersIcon size={13} color={C.textMuted} />
                  <span style={{ color:C.textMuted, fontSize:12 }}>{group.memberCount}/50</span>
                </div>
                {isBlocked && (
                  <div style={{ display:"flex", alignItems:"center", gap:4, backgroundColor:C.warning+"18", borderRadius:8, padding:"3px 8px", border:`1px solid ${C.warning}33` }}>
                    <LockIcon size={11} color={C.warning} />
                    <span style={{ color:C.warning, fontSize:11, fontWeight:600 }}>24h cooldown</span>
                  </div>
                )}
                <div style={{ display:"flex", gap:8 }}>
                  {group.isMember ? (
                    <>
                      <button onClick={()=>handleOpen(group)} style={{ padding:"8px 14px", borderRadius:10, border:`1px solid ${topicColor}`, backgroundColor:hasUnread?topicColor+"18":"transparent", color:topicColor, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                        {hasUnread?`Open (${group.unreadCount>99?"99+":group.unreadCount})`:"Open →"}
                      </button>
                      <button onClick={()=>handleLeave(group)} style={{ padding:"8px 12px", borderRadius:10, border:`1px solid ${C.border}`, backgroundColor:"transparent", color:C.textMuted, fontSize:13, cursor:"pointer" }}>Leave</button>
                    </>
                  ) : (
                    <button onClick={()=>!group.isFull&&handleJoin(group)} disabled={group.isFull||isBlocked}
                      style={{ padding:"9px 18px", borderRadius:10, backgroundColor:isBlocked?C.border:topicColor, color:"#fff", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", opacity:(group.isFull||isBlocked)?0.5:1 }}>
                      {group.isFull?"Full":isBlocked?"Cooldown":"Join 💜"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50 }}>
          <div style={{ backgroundColor:C.card, borderRadius:"24px 24px 0 0", padding:"24px 24px 40px", width:"100%", maxWidth:680, maxHeight:"92vh", overflowY:"auto", border:`1px solid ${C.border}`, borderBottom:"none" }}>
            <div style={{ width:40, height:4, borderRadius:2, backgroundColor:C.border, margin:"0 auto 16px" }} />
            <h2 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:26, margin:"0 0 4px" }}>Create a Circle 💜</h2>
            <p style={{ color:C.textMuted, fontSize:13, margin:"0 0 24px", lineHeight:1.6 }}>Build a safe space around a shared experience</p>

            <Label>Circle name *</Label>
            <input value={newGroup.name} onChange={e=>setNewGroup(p=>({...p,name:e.target.value}))} placeholder="e.g. Healing from Heartbreak" maxLength={50}
              style={inputStyle} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
            <p style={{ color:C.textMuted, fontSize:11, textAlign:"right", margin:"4px 0 16px" }}>{newGroup.name.length}/50</p>

            <Label>Topic *</Label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
              {TOPIC_OPTIONS.map(topic=>{ const color=TOPIC_COLORS[topic]||C.accent; const sel=newGroup.topic===topic; return (
                <button key={topic} onClick={()=>setNewGroup(p=>({...p,topic}))}
                  style={{ padding:"8px 14px", borderRadius:12, border:`1px solid ${sel?color:C.border}`, backgroundColor:sel?color+"22":C.inputBg, color:sel?color:C.textMuted, fontSize:12, fontWeight:600, cursor:"pointer" }}>{topic}</button>
              );})}
            </div>

            <Label>Icon</Label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:20 }}>
              {ICON_OPTIONS.map(icon=>(
                <button key={icon} onClick={()=>setNewGroup(p=>({...p,icon}))}
                  style={{ width:44, height:44, borderRadius:12, backgroundColor:newGroup.icon===icon?C.accent+"22":C.inputBg, border:`1px solid ${newGroup.icon===icon?C.accent:C.border}`, fontSize:22, cursor:"pointer" }}>{icon}</button>
              ))}
            </div>

            <Label>Description (optional)</Label>
            <textarea value={newGroup.description} onChange={e=>setNewGroup(p=>({...p,description:e.target.value}))} placeholder="What is this circle about? Who is it for?" maxLength={200} rows={3}
              style={{ ...inputStyle, resize:"none", paddingTop:12 }} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
            <p style={{ color:C.textMuted, fontSize:11, textAlign:"right", margin:"4px 0 16px" }}>{newGroup.description.length}/200</p>

            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button onClick={()=>{setShowCreate(false);setNewGroup({name:"",topic:"",description:"",icon:"💜"});}} style={{ flex:1, padding:14, borderRadius:14, border:`1px solid ${C.border}`, backgroundColor:"transparent", color:C.textMuted, fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleCreate} disabled={creating} style={{ flex:2, padding:14, borderRadius:14, backgroundColor:C.accent, border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", opacity:creating?0.6:1 }}>
                {creating ? "Creating..." : "Create Circle 💜"}
              </button>
            </div>
          </div>
        </div>
      )}

      <HushCircleSpinner visible={showSpinner} message={spinnerMsg} />
      <NoNetworkOverlay visible={showNoNetwork} action="feed" onClose={()=>setShowNoNetwork(false)} onRetry={()=>{setShowNoNetwork(false);load();}} />
    </div>
  );
}

function Label({ children }) { return <p style={{ color:"#C4A3E8", fontWeight:700, fontSize:12, letterSpacing:0.4, marginBottom:8 }}>{children}</p>; }
function Spinner() { return <div style={{ width:28, height:28, border:"2px solid #9B6FD4", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />; }
const inputStyle = { width:"100%", backgroundColor:"#0F0A1E", borderRadius:14, border:"1px solid #2D2450", padding:"12px 14px", color:"#EDE8F5", fontSize:15, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };

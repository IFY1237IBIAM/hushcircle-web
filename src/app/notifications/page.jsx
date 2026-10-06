"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import HushCircleSpinner from "../../components/HushCircleSpinner";
import Navbar from "../../components/Navbar";
import NoNetworkOverlay from "../../components/NoNetworkOverlay";
import { ReactionCareIcon, ReactionHeartIcon, ReactionHugIcon, ReactionStrongIcon, ReactionCryIcon, ReactionHopeIcon, CommentIcon, ReplyIcon, MentionIcon, AlertIcon, BellIcon, TrashIcon, CheckIcon, XIcon } from "../../components/Icons";
import { timeAgo } from "../../utils/time";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A", warning:"#D4A44C" };

const REACTION_ICON = {
  care:   { Icon: ReactionCareIcon,   color:"#9B6FD4" },
  heart:  { Icon: ReactionHeartIcon,  color:"#D4607A" },
  hug:    { Icon: ReactionHugIcon,    color:"#D4A44C" },
  strong: { Icon: ReactionStrongIcon, color:"#4CAF8F" },
  cry:    { Icon: ReactionCryIcon,    color:"#6B9FD4" },
  hope:   { Icon: ReactionHopeIcon,   color:"#4CAF8F" },
};

const TYPE_CONFIG = {
  reaction:     { Icon: ReactionCareIcon, iconColor:"#9B6FD4", label:"Reactions",  color:"#9B6FD4", format: n=>`${n.senderPseudonym} reacted to your post` },
  comment:      { Icon: CommentIcon,      iconColor:"#6B9FD4", label:"Comments",   color:"#6B9FD4", format: n=>`${n.senderPseudonym} commented on your post` },
  reply:        { Icon: ReplyIcon,        iconColor:"#C4A3E8", label:"Replies",    color:"#C4A3E8", format: n=>`${n.senderPseudonym} replied to your comment` },
  mention:      { Icon: MentionIcon,      iconColor:"#9B6FD4", label:"Mentions",   color:"#9B6FD4", format: n=>`${n.senderPseudonym} mentioned you` },
  post_removed: { Icon: AlertIcon,        iconColor:"#D4607A", label:"Moderation", color:"#D4607A", format: n=>n.adminMessage||"A post was removed" },
};

const ORDER = ["post_removed","mention","reaction","comment","reply"];

function groupNotifications(notifications) {
  const groups = {};
  for (const n of notifications) { const type = n.type||"reaction"; if (!groups[type]) groups[type]=[]; groups[type].push(n); }
  return ORDER.filter(t=>groups[t]?.length>0).map(type=>({ type, items:groups[type], config:TYPE_CONFIG[type]||TYPE_CONFIG.reaction }));
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [fetching,      setFetching]      = useState(true);
  const [showNoNetwork, setShowNoNetwork] = useState(false);

  useEffect(() => { if (!loading&&!user) router.push("/login"); }, [user,loading]);
  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setFetching(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications||[]);
      setShowNoNetwork(false);
      // Mark all read
      api.patch("/notifications/read-all").catch(()=>{});
    } catch (e) { if (e.message==="Network Error") setShowNoNetwork(true); }
    finally { setFetching(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev=>prev.filter(n=>n._id!==id));
    } catch {}
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    try {
      await api.delete("/notifications/all");
      setNotifications([]);
    } catch { alert("Could not clear notifications."); }
  };

  const grouped = groupNotifications(notifications);
  const unreadCount = notifications.filter(n=>!n.read).length;

  if (loading||!user) return null;

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, paddingTop:56, paddingBottom:80 }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>

        {/* Header */}
        <div style={{ paddingTop:32, paddingBottom:16, borderBottom:`1px solid ${C.border}`, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <h1 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:32, margin:0 }}>Notifications</h1>
            {unreadCount>0 && <p style={{ color:C.textMuted, fontSize:13, margin:"4px 0 0" }}>{unreadCount} unread</p>}
          </div>
          {notifications.length>0 && (
            <button onClick={handleClearAll} style={{ backgroundColor:"transparent", border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:10, padding:"6px 12px", fontSize:12, cursor:"pointer" }}>Clear all</button>
          )}
        </div>

        {fetching ? (
          <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>
        ) : notifications.length===0 ? (
          <div style={{ textAlign:"center", paddingTop:80 }}>
            <div style={{ width:80, height:80, borderRadius:40, backgroundColor:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <BellIcon size={40} color={C.textMuted} />
            </div>
            <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, marginBottom:8 }}>All quiet</h3>
            <p style={{ color:C.textMuted, fontSize:14 }}>Notifications will appear here when someone interacts with your posts.</p>
          </div>
        ) : (
          grouped.map(group => {
            const GIcon = group.config.Icon;
            return (
              <div key={group.type} style={{ marginBottom:24 }}>
                {/* Group header */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, paddingHorizontal:0 }}>
                  <div style={{ width:24, height:24, borderRadius:12, backgroundColor:group.config.color+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <GIcon size={13} color={group.config.iconColor} />
                  </div>
                  <span style={{ color:C.textMuted, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.6 }}>{group.config.label}</span>
                  <span style={{ color:C.textMuted, fontSize:11 }}>({group.items.length})</span>
                </div>

                {/* Items */}
                <div style={{ backgroundColor:C.card, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
                  {group.items.map((item, idx) => {
                    const config = TYPE_CONFIG[item.type]||TYPE_CONFIG.reaction;
                    const isModeration = item.type==="post_removed";
                    const reactionCfg = item.type==="reaction"&&item.reactionType ? REACTION_ICON[item.reactionType]||REACTION_ICON.care : null;
                    const IconComp = reactionCfg ? reactionCfg.Icon : config.Icon;
                    const iconColor = reactionCfg ? reactionCfg.color : config.iconColor;
                    return (
                      <div key={item._id} style={{ display:"flex", padding:"12px 16px", borderBottom:idx<group.items.length-1?`1px solid ${C.border}`:undefined, backgroundColor:item.read?undefined:C.card+"99", borderLeft:isModeration?`3px solid ${C.error}`:undefined, position:"relative" }}>
                        {!item.read && <div style={{ position:"absolute", left:6, top:20, width:6, height:6, borderRadius:3, backgroundColor:config.color }} />}
                        <div style={{ width:36, height:36, borderRadius:18, backgroundColor:config.color+"22", display:"flex", alignItems:"center", justifyContent:"center", marginRight:12, flexShrink:0 }}>
                          <IconComp size={18} color={iconColor} />
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ color:C.text, fontSize:14, lineHeight:1.5, fontWeight:item.read?400:600, margin:"0 0 2px" }}>{config.format(item)}</p>
                          {item.postPreview&&!isModeration&&<p style={{ color:C.textMuted, fontSize:12, fontStyle:"italic", margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>"{item.postPreview}"</p>}
                          {item.commentText&&<p style={{ color:C.textMuted, fontSize:12, fontStyle:"italic", margin:"0 0 4px" }}>"{item.commentText}"</p>}
                          {isModeration&&item.nextStep&&<p style={{ color:C.error, fontSize:12, margin:"0 0 4px" }}>{item.nextStep}</p>}
                          <p style={{ color:C.textMuted, fontSize:11, margin:0 }}>{timeAgo(item.createdAt)}</p>
                        </div>
                        <button onClick={()=>handleDelete(item._id)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", alignItems:"center", flexShrink:0 }}>
                          <XIcon size={14} color={C.textMuted} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </main>

      <NoNetworkOverlay visible={showNoNetwork} action="notifications" onClose={()=>setShowNoNetwork(false)} onRetry={()=>{setShowNoNetwork(false);load();}} />
    </div>
  );
}

function Spinner() { return <div style={{ width:28, height:28, border:"2px solid #9B6FD4", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />; }

"use client";
import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { MOOD_CONFIG, REACTIONS, REPORT_REASONS, COLORS as C } from "../lib/constants";
import { timeAgo } from "../utils/time";
import {
  CommentIcon, BookmarkIcon, ShareIcon, DotsIcon,
  TrashIcon, EditIcon, HideIcon, ReportIcon,
  SendIcon, RepostIcon, CheckIcon, ReactionCareIcon,
} from "./Icons";
import CommentThread, { getTotalCommentCount, formatCount } from "./CommentThread";
import HashtagText from "./HashtagText";
import AvatarVibeEmoji from "./AvatarVibeEmoji";
import UserProfileCard from "./UserProfileCard";
import OnlineDot from "./OnlineDot";
import { getLocalDateString } from "../utils/time";

const AVATAR_COLORS = ["#9B6FD4","#D4607A","#6B9FD4","#4CAF8F","#D4A44C","#E879F9"];
function avatarColor(p) { return AVATAR_COLORS[(p?.charCodeAt(0)||0) % AVATAR_COLORS.length]; }

function Avatar({ pseudonym, size = 36, onlineStatus, showOnline, onClick, localDate }) {
  const bg = avatarColor(pseudonym);
  return (
    <div style={{ position:"relative", flexShrink:0, cursor:onClick?"pointer":"default" }} onClick={onClick}>
      <div style={{ width:size, height:size, borderRadius:size/2, backgroundColor:bg+"22", border:`1.5px solid ${bg}55`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ color:bg, fontWeight:700, fontSize:size*0.42, fontFamily:"Nunito,sans-serif" }}>
          {pseudonym?.[0]?.toUpperCase()}
        </span>
      </div>
      <AvatarVibeEmoji pseudonym={pseudonym} size={11} localDate={localDate} />
      {showOnline && <OnlineDot isOnline={onlineStatus} showOnlineStatus size={size*0.32} borderColor="#1A1330" />}
    </div>
  );
}

function MoodBadge({ mood }) {
  const cfg = MOOD_CONFIG[mood] || MOOD_CONFIG.sadness;
  const CfgIcon = cfg.Icon;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, backgroundColor:cfg.color+"22", color:cfg.color, borderRadius:8, padding:"3px 9px", fontSize:11, fontWeight:600 }}>
      <CfgIcon size={13} color={cfg.color} /> {cfg.label}
    </span>
  );
}

function Sheet({ children, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.75)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50 }} onClick={onClose}>
      <div style={{ backgroundColor:"#1A1330", borderRadius:"24px 24px 0 0", padding:"24px 20px 40px", width:"100%", maxWidth:560, maxHeight:"85vh", overflowY:"auto", border:"1px solid #2D2450", borderBottom:"none" }} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function SheetBtn({ Icon, iconColor, label, sub, onClick, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"13px 16px", backgroundColor:hov?"rgba(255,255,255,0.04)":"transparent", border:"none", borderRadius:14, cursor:"pointer", textAlign:"left" }}>
      {Icon && <div style={{ width:38, height:38, borderRadius:10, backgroundColor:iconColor+"22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon size={18} color={iconColor} /></div>}
      <div>
        <p style={{ color:danger?"#D4607A":"#EDE8F5", fontWeight:700, fontSize:14, margin:0 }}>{label}</p>
        {sub && <p style={{ color:"#8B7FA8", fontSize:12, margin:"2px 0 0" }}>{sub}</p>}
      </div>
    </button>
  );
}

export default function PostCard({
  post,
  onDeleted,
  onEdited,
  onHidden,
  onReposted,
  onUnreposted,
  onRepostPress,
}) {
  const { user } = useAuth();
  const isOwn = post.pseudonym === user?.pseudonym || post._isOwn;
  const mood = MOOD_CONFIG[post.mood] || MOOD_CONFIG.sadness;
  const localDate = getLocalDateString();

  const [reactionCounts, setReactionCounts] = useState(post.reactionCounts || {});
  const [totalReactions, setTotalReactions] = useState(post.totalReactions || 0);
  const [userReaction,   setUserReaction]   = useState(post.userReaction   || null);
  const [comments,       setComments]       = useState(post.comments        || []);
  const [commentCount,   setCommentCount]   = useState(
    getTotalCommentCount(post.comments, post.commentCount)
  );
  const [saved, setSaved] = useState(post.isSaved || false);

  const [showReactions,  setShowReactions]  = useState(false);
  const [showComments,   setShowComments]   = useState(false);
  const [showOptions,    setShowOptions]    = useState(false);
  const [showReport,     setShowReport]     = useState(false);
  const [showDeleteConf, setShowDeleteConf] = useState(false);
  const [showEdit,       setShowEdit]       = useState(false);
  const [showUserCard,   setShowUserCard]   = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments,setLoadingComments]= useState(false);

  const [commentText,   setCommentText]   = useState("");
  const [editContent,   setEditContent]   = useState(post.content);
  const [editMood,      setEditMood]      = useState(post.mood);
  const [reportReason,  setReportReason]  = useState(null);
  const [reportDetails, setReportDetails] = useState("");
  const [reportDone,    setReportDone]    = useState(false);

  const [reacting,   setReacting]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [editing,    setEditing]    = useState(false);
  const [reporting,  setReporting]  = useState(false);

  const handleReaction = async (r) => {
    if (reacting) return;
    setReacting(true); setShowReactions(false);
    const prev = userReaction;
    const prevCounts = { ...reactionCounts };
    const prevTotal  = totalReactions;
    const isToggle   = r.key === prev;
    const newCounts  = { ...reactionCounts };
    if (prev) { newCounts[prev] = Math.max(0,(newCounts[prev]||1)-1); if(!newCounts[prev]) delete newCounts[prev]; }
    if (!isToggle) newCounts[r.key] = (newCounts[r.key]||0)+1;
    setReactionCounts(newCounts);
    setTotalReactions(prevTotal+(isToggle?-1:prev?0:1));
    setUserReaction(isToggle?null:r.key);
    try {
      const res = await api.post(`/posts/${post._id}/react`,{ type:r.key });
      setReactionCounts(res.data.reactionCounts||{}); setTotalReactions(res.data.totalReactions||0); setUserReaction(res.data.userReaction||null);
    } catch { setUserReaction(prev); setReactionCounts(prevCounts); setTotalReactions(prevTotal); }
    finally { setReacting(false); }
  };

  const handleOpenComments = async () => {
    setShowComments(v=>!v);
    if (!commentsLoaded && !showComments) {
      setLoadingComments(true);
      try {
        const res = await api.get(`/posts/${post._id}/comments`);
        setComments(res.data.comments||[]);
        setCommentCount(getTotalCommentCount(res.data.comments, res.data.total));
        setCommentsLoaded(true);
      } catch {}
      finally { setLoadingComments(false); }
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()||submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${post._id}/comments`,{ text:commentText.trim() });
      setComments(prev=>[...prev, res.data.comment]);
      setCommentCount(c=>c+1); setCommentText("");
    } catch {}
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/posts/${post._id}`); onDeleted?.(post._id); }
    catch { setDeleting(false); }
    setShowDeleteConf(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim()||editing) return;
    setEditing(true);
    try {
      await api.put(`/posts/${post._id}`,{ content:editContent.trim(), mood:editMood });
      onEdited?.(post._id, editContent.trim(), editMood); setShowEdit(false);
    } catch {}
    finally { setEditing(false); }
  };

  const handleSave = async () => {
    try { const res = await api.post(`/posts/${post._id}/save`); setSaved(res.data.saved); } catch {}
    setShowOptions(false);
  };

  const handleShare = () => {
    const url = `https://hushcircle.org/post/${post._id}`;
    if (navigator.share) navigator.share({ title:"HushCircle", text:post.content?.slice(0,100), url });
    else { navigator.clipboard?.writeText(url); alert("Link copied!"); }
    setShowOptions(false);
  };

  const handleReport = async () => {
    if (!reportReason||reporting) return;
    setReporting(true);
    try { await api.post(`/posts/${post._id}/report`,{ reason:reportReason, details:reportDetails }); setReportDone(true); }
    catch {}
    finally { setReporting(false); }
  };

  const handleReplyAdded  = (commentId, reply)  => setComments(prev=>prev.map(c=>c._id===commentId?{...c,replies:[...(c.replies||[]),reply]}:c));
  const handleCommentUpdated = (commentId, text) => setComments(prev=>prev.map(c=>c._id===commentId?{...c,text,edited:true}:c));
  const handleCommentDeleted = (commentId)       => { setComments(prev=>prev.map(c=>c._id===commentId?{...c,deleted:true}:c)); setCommentCount(n=>Math.max(0,n-1)); };

  const activeReaction = REACTIONS.find(r=>r.key===userReaction);
  const ActiveReactionIcon = activeReaction?.Icon || null;

  return (
    <>
      <article style={{ backgroundColor:C.card, borderRadius:16, border:`1px solid ${isOwn?C.accent+"55":C.border}`, borderLeft:`3px solid ${mood.color}`, marginBottom:12, overflow:"hidden" }}>
        <div style={{ padding:"14px 16px" }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Avatar
                pseudonym={post.pseudonym}
                size={36}
                onlineStatus={post.isOnline}
                showOnline={post.showOnlineStatus}
                localDate={localDate}
                onClick={()=>!isOwn&&setShowUserCard(true)}
              />
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:1 }}>
                  <span style={{ color:C.text, fontWeight:700, fontSize:14 }}>@{post.pseudonym}</span>
                  {isOwn && <span style={{ backgroundColor:C.accent+"22", color:C.accent, borderRadius:6, padding:"1px 6px", fontSize:10, fontWeight:700 }}>You</span>}
                </div>
                <span style={{ color:C.textMuted, fontSize:11 }}>{timeAgo(post.createdAt)}</span>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <MoodBadge mood={post.mood} />
              <button onClick={()=>setShowOptions(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, borderRadius:8, display:"flex", alignItems:"center" }}>
                <DotsIcon size={18} color={C.textMuted} />
              </button>
            </div>
          </div>

          {/* Content with hashtag highlighting */}
          <div style={{ marginBottom:12 }}>
            <HashtagText
              text={post.content}
              style={{ color:C.text, fontSize:14, lineHeight:1.65, whiteSpace:"pre-wrap", wordBreak:"break-word" }}
              numberOfLines={null}
              onHashtagPress={(tag)=>{ window.location.href=`/hashtag/${tag.replace("#","")}`; }}
            />
          </div>

          {/* Actions */}
          <div style={{ display:"flex", alignItems:"center", gap:18, paddingTop:10, borderTop:`1px solid ${C.border}` }}>

            {/* Reactions */}
            <div style={{ position:"relative" }}>
              <button onClick={()=>setShowReactions(!showReactions)} style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", cursor:"pointer", padding:0 }}>
                {ActiveReactionIcon
                  ? <ActiveReactionIcon size={18} color={activeReaction.iconColor} />
                  : <ReactionCareIcon size={18} color={C.textMuted} />}
                <span style={{ color:userReaction?C.accent:C.textMuted, fontSize:13, fontWeight:600 }}>{totalReactions>0?formatCount(totalReactions):"React"}</span>
              </button>

              {showReactions && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:10 }} onClick={()=>setShowReactions(false)} />
                  <div style={{ position:"absolute", bottom:32, left:0, backgroundColor:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"10px 8px", display:"flex", gap:6, zIndex:20, boxShadow:"0 8px 32px rgba(0,0,0,0.6)" }}>
                    {REACTIONS.map(r=>{ const RIcon = r.Icon; return (
                      <button key={r.key} onClick={()=>handleReaction(r)} title={r.label}
                        style={{ background:userReaction===r.key?C.accent+"22":"none", border:"none", cursor:"pointer", padding:"6px 8px", borderRadius:10, display:"flex", flexDirection:"column", alignItems:"center", gap:3, transition:"transform 0.1s" }}
                        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.25)"}
                        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                        <RIcon size={22} color={r.iconColor} />
                        <span style={{ color:C.textMuted, fontSize:9, fontWeight:600 }}>{r.label.split(" ")[0]}</span>
                      </button>
                    );})}
                  </div>
                </>
              )}
            </div>

            {/* Comments */}
            <button onClick={handleOpenComments} style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", cursor:"pointer", padding:0 }}>
              <CommentIcon size={18} color={showComments?C.accent:C.textMuted} />
              <span style={{ color:showComments?C.accent:C.textMuted, fontSize:13, fontWeight:600 }}>{commentCount>0?formatCount(commentCount):"Comment"}</span>
            </button>

            {/* Repost */}
            {!isOwn && post.allowReposts !== false && (
  <button
    onClick={() => onRepostPress?.(post._id)}
    style={{
      display:"flex",
      alignItems:"center",
      gap:5,
      background:"none",
      border:"none",
      cursor:"pointer",
      padding:0,
    }}
  >
    <RepostIcon size={16} color={post.isReposted ? C.accent : C.textMuted} />
    {post.repostCount > 0 && (
      <span style={{
        color: post.isReposted ? C.accent : C.textMuted,
        fontSize:13,
        fontWeight:600,
      }}>
        {post.repostCount}
      </span>
    )}
  </button>
)}

            {/* Save */}
            {!isOwn && (
              <button onClick={handleSave} style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", cursor:"pointer", padding:0 }}>
                <BookmarkIcon size={18} color={saved?C.accent:C.textMuted} filled={saved} />
              </button>
            )}

            {/* Share */}
            <button onClick={handleShare} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center" }}>
              <ShareIcon size={16} color={C.textMuted} />
            </button>
          </div>

          {/* Reaction counts row */}
          {totalReactions>0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
              {Object.entries(reactionCounts).map(([key,count])=>{
                if (!count) return null;
                const r = REACTIONS.find(x=>x.key===key);
                if (!r) return null;
                const RIcon = r.Icon;
                return (
                  <span key={key} style={{ display:"inline-flex", alignItems:"center", gap:4, backgroundColor:C.bg, borderRadius:20, padding:"2px 10px", fontSize:12, color:C.textMuted }}>
                    <RIcon size={13} color={r.iconColor} /> {count}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Comments section — uses CommentThread exactly like mobile */}
        {showComments && (
          <div style={{ borderTop:`1px solid ${C.border}`, padding:"12px 16px" }}>
            {loadingComments ? (
              <div style={{ textAlign:"center", padding:16 }}>
                <div style={{ width:20, height:20, border:`2px solid ${C.accent}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />
              </div>
            ) : (
              <>
                {comments.length===0 && <p style={{ color:C.textMuted, fontSize:12, textAlign:"center", marginBottom:12 }}>No comments yet — be the first to offer support 💜</p>}

                {/* CommentThread for each comment */}
                <div style={{ marginBottom:12 }}>
                  {comments.map((comment,i)=>(
                    <CommentThread
                      key={comment._id||i}
                      comment={comment}
                      postId={post._id}
                      onReplyAdded={handleReplyAdded}
                      onCommentUpdated={handleCommentUpdated}
                      onCommentDeleted={handleCommentDeleted}
                    />
                  ))}
                </div>

                {/* Add comment */}
                <form onSubmit={handleComment} style={{ display:"flex", gap:8 }}>
                  <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Offer support..." maxLength={200}
                    style={{ flex:1, backgroundColor:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"8px 12px", color:C.text, fontSize:13, outline:"none" }}
                    onFocus={e=>e.target.style.borderColor=C.accent}
                    onBlur={e=>e.target.style.borderColor=C.border} />
                  <button type="submit" disabled={!commentText.trim()||submitting}
                    style={{ width:38, height:38, borderRadius:10, backgroundColor:C.accent, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:!commentText.trim()?0.4:1, flexShrink:0 }}>
                    <SendIcon size={15} color="#fff" />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </article>

      {/* Options sheet */}
      {showOptions && (
        <Sheet onClose={()=>setShowOptions(false)}>
          <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:20, marginBottom:12 }}>Post options</h3>
          {isOwn && <>
            <SheetBtn Icon={EditIcon}  iconColor={C.accent}    label="Edit post"    sub="Change content or mood"      onClick={()=>{setShowOptions(false);setShowEdit(true);}} />
            <SheetBtn Icon={TrashIcon} iconColor={C.error}     label="Delete post"  sub="Permanently remove"          onClick={()=>{setShowOptions(false);setShowDeleteConf(true);}} danger />
          </>}
          <SheetBtn Icon={BookmarkIcon} iconColor={C.accentSoft} label={saved?"Unsave post":"Save post"} sub={saved?"Remove from saved":"Read it later"} onClick={handleSave} />
          <SheetBtn Icon={ShareIcon}   iconColor={C.textMuted}  label="Share / Copy link"                             onClick={handleShare} />
          {!isOwn && <>
            <SheetBtn Icon={HideIcon}   iconColor={C.textMuted}  label="Hide post"    sub="You won't see this again"  onClick={()=>{onHidden?.(post._id);setShowOptions(false);}} />
            <SheetBtn Icon={ReportIcon} iconColor={C.error}      label="Report post"  sub="Let us know what's wrong"  onClick={()=>{setShowOptions(false);setShowReport(true);}} danger />
          </>}
        </Sheet>
      )}

      {/* Delete confirm */}
      {showDeleteConf && (
        <Sheet onClose={()=>setShowDeleteConf(false)}>
          <div style={{ textAlign:"center" }}>
            <span style={{ fontSize:48 }}>🗑️</span>
            <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, margin:"12px 0 8px" }}>Delete this post?</h3>
            <p style={{ color:C.textMuted, fontSize:13, lineHeight:1.6, marginBottom:24 }}>This cannot be undone. All reactions and comments will also be removed.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowDeleteConf(false)} style={outlineBtn}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ ...solidBtn, backgroundColor:C.error }}>{deleting?"Deleting...":"Delete"}</button>
            </div>
          </div>
        </Sheet>
      )}

      {/* Edit sheet */}
      {showEdit && (
        <Sheet onClose={()=>setShowEdit(false)}>
          <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:20, marginBottom:14 }}>Edit post</h3>
          <p style={{ color:C.textMuted, fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>Mood</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
            {Object.values(MOOD_CONFIG).map(m=>{ const MIcon = m.Icon; return (
              <button key={m.key} onClick={()=>setEditMood(m.key)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, border:`1.5px solid ${editMood===m.key?m.color:C.border}`, backgroundColor:editMood===m.key?m.color+"22":C.bg, cursor:"pointer" }}>
                <MIcon size={14} color={editMood===m.key?m.color:C.textMuted} />
                <span style={{ color:editMood===m.key?m.color:C.textMuted, fontSize:12, fontWeight:600 }}>{m.label}</span>
              </button>
            );})}</div>
          <textarea value={editContent} onChange={e=>setEditContent(e.target.value)} maxLength={500} rows={4}
            style={{ width:"100%", backgroundColor:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", color:C.text, fontSize:14, resize:"none", outline:"none", fontFamily:"inherit", boxSizing:"border-box", marginBottom:14 }}
            onFocus={e=>e.target.style.borderColor=C.accent}
            onBlur={e=>e.target.style.borderColor=C.border} />
          <p style={{ color:C.textMuted, fontSize:11, textAlign:"right", margin:"-10px 0 14px" }}>{editContent.length}/500</p>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setShowEdit(false)} style={outlineBtn}>Cancel</button>
            <button onClick={handleEdit} disabled={editing||!editContent.trim()} style={{ ...solidBtn, opacity:!editContent.trim()?0.4:1 }}>{editing?"Saving...":"Save changes 💜"}</button>
          </div>
        </Sheet>
      )}

      {/* Report sheet */}
      {showReport && (
        <Sheet onClose={()=>{setShowReport(false);setReportDone(false);setReportReason(null);setReportDetails("");}}>
          {reportDone ? (
            <div style={{ textAlign:"center" }}>
              <CheckIcon size={48} color={C.success} />
              <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, margin:"12px 0 8px" }}>Report submitted</h3>
              <p style={{ color:C.textMuted, fontSize:13, marginBottom:20 }}>Thank you for helping keep HushCircle safe 💜</p>
              <button onClick={()=>{setShowReport(false);setReportDone(false);}} style={solidBtn}>Close</button>
            </div>
          ) : (
            <>
              <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:20, marginBottom:4 }}>Report post</h3>
              <p style={{ color:C.textMuted, fontSize:13, marginBottom:14 }}>What's wrong with this post?</p>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
                {REPORT_REASONS.map(r=>{ const RIcon = r.Icon; return (
                  <button key={r.key} onClick={()=>setReportReason(r.key)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:12, border:`1.5px solid ${reportReason===r.key?C.accent:C.border}`, backgroundColor:reportReason===r.key?C.accent+"11":C.bg, cursor:"pointer", textAlign:"left" }}>
                    <div style={{ width:34, height:34, borderRadius:8, backgroundColor:r.iconColor+"22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <RIcon size={16} color={r.iconColor} />
                    </div>
                    <div>
                      <p style={{ color:C.text, fontWeight:700, fontSize:13, margin:0 }}>{r.label}</p>
                      <p style={{ color:C.textMuted, fontSize:11, margin:0 }}>{r.sub}</p>
                    </div>
                    {reportReason===r.key && <CheckIcon size={16} color={C.accent} />}
                  </button>
                );})}</div>
              <textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} placeholder="Additional details (optional)" maxLength={200} rows={2}
                style={{ width:"100%", backgroundColor:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", color:C.text, fontSize:13, resize:"none", outline:"none", fontFamily:"inherit", marginBottom:14, boxSizing:"border-box" }} />
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setShowReport(false)} style={outlineBtn}>Cancel</button>
                <button onClick={handleReport} disabled={!reportReason||reporting}
                  style={{ ...solidBtn, backgroundColor:C.error, opacity:!reportReason?0.4:1 }}>{reporting?"Submitting...":"Submit report"}</button>
              </div>
            </>
          )}
        </Sheet>
      )}

      {/* User profile card on avatar tap */}
      {showUserCard && (
        <UserProfileCard pseudonym={post.pseudonym} visible={showUserCard} onClose={()=>setShowUserCard(false)} />
      )}
    </>
  );
}

const solidBtn  = { flex:1, padding:"12px 0", backgroundColor:"#9B6FD4", color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" };
const outlineBtn= { flex:1, padding:"12px 0", backgroundColor:"transparent", color:"#8B7FA8", border:"1px solid #2D2450", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer" };

function REACTIONS_0_Icon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color+"44"} stroke={color} strokeWidth={2} /></svg>;
}

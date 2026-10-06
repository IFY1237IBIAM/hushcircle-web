"use client";
// Matches mobile CommentThread.js exactly
import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import UserProfileCard from "./UserProfileCard";
import NoNetworkOverlay from "./NoNetworkOverlay";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A", warning:"#D4A44C", inputBg:"#0F0A1E" };

// ── Exports matching mobile ────────────────────────────────────────────────
export const getTotalCommentCount = (comments, serverCount) => {
  if (serverCount !== undefined && serverCount !== null) return serverCount;
  if (!comments || !Array.isArray(comments)) return 0;
  return comments.reduce((total, comment) => {
    if (comment.deleted) return total;
    const activeReplies = (comment.replies || []).filter(r => !r.deleted).length;
    return total + 1 + activeReplies;
  }, 0);
};

export const formatCount = (count) => {
  if (count === null || count === undefined) return "0";
  if (count < 1000) return String(count);
  if (count < 1_000_000) { const v = count / 1000; return v >= 10 ? `${Math.floor(v)}k` : `${v.toFixed(1)}k`; }
  const v = count / 1_000_000;
  return v >= 10 ? `${Math.floor(v)}M` : `${v.toFixed(1)}M`;
};

const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const copyToClipboard = (text) => {
  navigator.clipboard?.writeText(text).catch(() => {});
};

const REPORT_REASONS = [
  { key: "harmful_content", label: "Harmful content",  sub: "Promotes violence or self-harm", color: "#D4A44C" },
  { key: "bullying",        label: "Bullying",          sub: "Targets or harasses someone",   color: "#D4607A" },
  { key: "spam",            label: "Spam",              sub: "Fake or repetitive",            color: "#8B7FA8" },
  { key: "inappropriate",   label: "Inappropriate",     sub: "Offensive or explicit",         color: "#D4607A" },
  { key: "misinformation",  label: "Misinformation",    sub: "False or misleading",           color: "#D4A44C" },
  { key: "other",           label: "Other",             sub: "Something else",                color: "#8B7FA8" },
];

// ── Sub-components ────────────────────────────────────────────────────────

function Avatar({ pseudonym, size = 34, isOnlineStatus = null, showOnlineDot = false, onClick }) {
  return (
    <div style={{ position:"relative", flexShrink:0, cursor:onClick?"pointer":"default" }} onClick={onClick}>
      <div style={{ width:size, height:size, borderRadius:size/2, backgroundColor:C.accent+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ color:C.accentSoft, fontWeight:600, fontSize:size*0.38 }}>{pseudonym?.[0]?.toUpperCase()||"?"}</span>
      </div>
      {showOnlineDot && isOnlineStatus !== null && (
        <div style={{ position:"absolute", width:size*0.3, height:size*0.3, borderRadius:size*0.15, backgroundColor:isOnlineStatus?C.success:C.error, bottom:-1, right:-1, border:`2px solid ${C.bg}` }} />
      )}
    </div>
  );
}

function AuthorBadge() {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, backgroundColor:"#D4A44C33", borderRadius:8, padding:"2px 6px", border:"1px solid #D4A44C66", fontSize:10, color:"#D4A44C", fontWeight:600 }}>
      ✏️ Author
    </span>
  );
}

function ReplyInput({ onSubmit, placeholder, onCancel, submitting }) {
  const [text, setText] = useState("");
  return (
    <div style={{ backgroundColor:C.card, borderRadius:12, padding:10, border:`1px solid ${C.accent}44` }}>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={placeholder} maxLength={200} rows={2}
        style={{ width:"100%", backgroundColor:"transparent", border:"none", outline:"none", color:C.text, fontSize:14, fontFamily:"inherit", resize:"none", boxSizing:"border-box" }} />
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8 }}>
        <button onClick={onCancel} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${C.border}`, backgroundColor:"transparent", color:C.textMuted, fontSize:12, cursor:"pointer" }}>Cancel</button>
        <button onClick={() => { if (text.trim()) { onSubmit(text.trim()); setText(""); }}} disabled={!text.trim()||submitting}
          style={{ padding:"6px 14px", borderRadius:8, border:"none", backgroundColor:C.accent, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", opacity:(!text.trim()||submitting)?0.4:1, display:"flex", alignItems:"center", gap:5 }}>
          ↗ Reply
        </button>
      </div>
    </div>
  );
}

function InlineEdit({ value, onChange, onSave, onCancel, saving }) {
  return (
    <div style={{ marginTop:4 }}>
      <textarea value={value} onChange={e=>onChange(e.target.value)} maxLength={200} rows={2} autoFocus
        style={{ width:"100%", backgroundColor:C.card, borderRadius:10, border:`1px solid ${C.accent}55`, padding:10, color:C.text, fontSize:13, fontFamily:"inherit", resize:"none", outline:"none", marginBottom:8, boxSizing:"border-box" }} />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${C.border}`, backgroundColor:"transparent", color:C.textMuted, fontSize:12, cursor:"pointer" }}>Cancel</button>
        <button onClick={onSave} disabled={saving} style={{ padding:"6px 14px", borderRadius:8, border:"none", backgroundColor:C.accent, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", opacity:saving?0.6:1 }}>
          {saving?"Saving...":"Save"}
        </button>
      </div>
    </div>
  );
}

function OptionsSheet({ visible, onClose, onEdit, onDelete, onCopy, onReport, isDeleted, isOwner }) {
  if (!visible) return null;
  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50 }} onClick={onClose}>
      <div style={{ backgroundColor:C.card, borderRadius:"20px 20px 0 0", paddingBottom:32, paddingTop:8, borderTop:`1px solid ${C.border}`, width:"100%", maxWidth:560 }} onClick={e=>e.stopPropagation()}>
        {!isDeleted && <SheetBtn label="Copy text"    onClick={()=>{onClose();copyToClipboard?.()}} color={C.text} />}
        {isOwner&&!isDeleted && <>
          <div style={{ height:1, backgroundColor:C.border, margin:"0 16px" }} />
          <SheetBtn label="Edit"   onClick={()=>{onClose();onEdit()}}   color={C.text} />
          <div style={{ height:1, backgroundColor:C.border, margin:"0 16px" }} />
          <SheetBtn label="Delete" onClick={()=>{onClose();onDelete()}} color={C.error} />
        </>}
        {!isOwner&&!isDeleted && <>
          <div style={{ height:1, backgroundColor:C.border, margin:"0 16px" }} />
          <SheetBtn label="Report" onClick={()=>{onClose();onReport()}} color={C.error} />
        </>}
        <div style={{ height:1, backgroundColor:C.border, margin:"0 16px" }} />
        <SheetBtn label="Cancel" onClick={onClose} color={C.textMuted} center />
      </div>
    </div>
  );
}

function SheetBtn({ label, onClick, color, center }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:"100%", padding:"16px 24px", backgroundColor:hov?"rgba(255,255,255,0.04)":"transparent", border:"none", color, fontSize:16, fontWeight:600, cursor:"pointer", textAlign:center?"center":"left" }}>
      {label}
    </button>
  );
}

function ReportSheet({ visible, onClose, target, postId }) {
  const [reason,     setReason]     = useState(null);
  const [details,    setDetails]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  useEffect(() => { if (visible) { setReason(null); setDetails(""); setDone(false); } }, [visible, target]);

  if (!visible || !target) return null;

  const handleSubmit = async () => {
    if (!reason||submitting) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${postId}/comments/${target.commentId}/report`, { reason, details, replyId:target.replyId||null, pseudonym:target.pseudonym, text:target.text });
      setDone(true);
    } catch (e) { alert(e.response?.data?.message||"Could not submit report."); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.6)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50 }} onClick={onClose}>
      <div style={{ backgroundColor:C.card, borderRadius:"24px 24px 0 0", padding:20, paddingBottom:40, borderTop:`1px solid ${C.border}`, width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:2, backgroundColor:C.border, margin:"0 auto 16px" }} />
        {done ? (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ width:72, height:72, borderRadius:36, backgroundColor:C.accent+"18", border:`1px solid ${C.accent}33`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:32 }}>💜</div>
            <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, margin:"0 0 4px" }}>Thank you</h3>
            <p style={{ color:C.textMuted, fontSize:13, lineHeight:1.6, margin:"0 0 14px" }}>Your report has been submitted. Our team will review it.</p>
            <button onClick={onClose} style={{ width:"100%", padding:14, borderRadius:14, border:"none", backgroundColor:C.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Done</button>
          </div>
        ) : (
          <>
            <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, margin:"0 0 4px" }}>Report {target.replyId?"reply":"comment"}</h3>
            <p style={{ color:C.textMuted, fontSize:13, margin:"0 0 14px", lineHeight:1.6 }}>Help us keep the community safe and supportive</p>
            {target.text && (
              <div style={{ backgroundColor:C.inputBg, borderRadius:12, padding:12, marginBottom:14, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.accent}` }}>
                <p style={{ color:C.accentSoft, fontWeight:700, fontSize:12, margin:"0 0 4px" }}>@{target.pseudonym}</p>
                <p style={{ color:C.textMuted, fontSize:13, lineHeight:1.55, margin:0 }}>{target.text.slice(0,120)}</p>
              </div>
            )}
            {REPORT_REASONS.map(r => (
              <button key={r.key} onClick={()=>setReason(r.key)}
                style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:10, borderRadius:12, marginBottom:6, border:`1px solid ${reason===r.key?C.accent+"44":"transparent"}`, backgroundColor:reason===r.key?C.accent+"11":"transparent", cursor:"pointer", textAlign:"left" }}>
                <div>
                  <p style={{ color:reason===r.key?C.accentSoft:C.text, fontWeight:500, fontSize:13, margin:"0 0 2px" }}>{r.label}</p>
                  <p style={{ color:C.textMuted, fontSize:11, margin:0 }}>{r.sub}</p>
                </div>
                {reason===r.key && <span style={{ marginLeft:"auto", color:C.accent }}>✓</span>}
              </button>
            ))}
            <textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Add details (optional)..." maxLength={300} rows={2}
              style={{ width:"100%", backgroundColor:C.inputBg, borderRadius:12, border:`1px solid ${C.border}`, padding:12, color:C.text, fontSize:14, fontFamily:"inherit", resize:"none", outline:"none", marginTop:10, marginBottom:8, boxSizing:"border-box" }} />
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={onClose} style={{ flex:1, padding:14, borderRadius:14, border:`1px solid ${C.border}`, backgroundColor:"transparent", color:C.textMuted, fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleSubmit} disabled={!reason||submitting}
                style={{ flex:2, padding:14, borderRadius:14, border:"none", backgroundColor:C.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", opacity:(!reason||submitting)?0.5:1 }}>
                {submitting?"Submitting...":"Submit report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── ReplyItem ─────────────────────────────────────────────────────────────

function ReplyItem({ reply, postId, commentId, currentUserId, onReplyToReply, isLast, onReplyUpdated, onReplyDeleted, onReport }) {
  const [showInput,   setShowInput]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [editing,     setEditing]     = useState(false);
  const [editText,    setEditText]    = useState(reply.text);
  const [savingEdit,  setSavingEdit]  = useState(false);
  const [showUserCard,setShowUserCard]= useState(false);

  const isOwner   = reply.author === currentUserId || reply.author?.toString() === currentUserId;
  const isDeleted = reply.deleted;

  const handleSubmit = async (text) => {
    setSubmitting(true);
    await onReplyToReply(text, reply.pseudonym);
    setSubmitting(false); setShowInput(false);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()||editText.trim()===reply.text) { setEditing(false); return; }
    setSavingEdit(true);
    try {
      await api.put(`/posts/${postId}/comments/${commentId}/replies/${reply._id}`, { text: editText.trim() });
      onReplyUpdated(reply._id, editText.trim()); setEditing(false);
    } catch (e) { alert(e.response?.data?.message||"Could not update reply."); }
    finally { setSavingEdit(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this reply?")) return;
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}/replies/${reply._id}`);
      onReplyDeleted(reply._id);
    } catch { alert("Could not delete reply."); }
  };

  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex" }}>
        {/* Thread line */}
        <div style={{ width:20, display:"flex", flexDirection:"column", alignItems:"center", marginRight:8 }}>
          <div style={{ width:2, flex:1, height:isLast?20:undefined, backgroundColor:C.border, borderRadius:1 }} />
          <div style={{ width:10, height:2, backgroundColor:C.border, alignSelf:"flex-start", marginTop:-2 }} />
        </div>
        <div style={{ flex:1, display:"flex", gap:8, alignItems:"flex-start" }}>
          <Avatar pseudonym={reply.pseudonym} size={26} onClick={()=>!isOwner&&setShowUserCard(true)} />
          <div style={{ flex:1, backgroundColor:C.inputBg, borderRadius:12, padding:10, border:`1px solid ${C.border}`, opacity:isDeleted?0.55:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
              <span style={{ color:C.accentSoft, fontWeight:600, fontSize:12 }}>{reply.pseudonym}</span>
              {reply.isPostAuthor&&!isDeleted&&<AuthorBadge />}
              {reply.replyingTo&&!isDeleted&&<span style={{ color:C.textMuted, fontSize:11 }}>› <span style={{ color:C.accent, fontWeight:600 }}>{reply.replyingTo}</span></span>}
              <span style={{ color:C.textMuted, fontSize:11, marginLeft:"auto" }}>{timeAgo(reply.createdAt)}</span>
              {!isDeleted&&<button onClick={()=>setShowOptions(true)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textMuted, fontSize:14, padding:"0 0 0 6px" }}>⋯</button>}
            </div>
            {editing ? (
              <InlineEdit value={editText} onChange={setEditText} onSave={handleSaveEdit} onCancel={()=>{setEditing(false);setEditText(reply.text)}} saving={savingEdit} />
            ) : (
              <>
                <p style={{ color:isDeleted?C.textMuted:C.text, fontSize:13, lineHeight:1.55, marginBottom:4, fontStyle:isDeleted?"italic":"normal", margin:"0 0 4px" }}>{reply.text}</p>
                {reply.edited&&!isDeleted&&<p style={{ color:C.textMuted, fontSize:10, fontStyle:"italic", margin:"0 0 4px" }}>edited</p>}
                {!isDeleted&&(
                  <button onClick={()=>setShowInput(!showInput)} style={{ background:"none", border:"none", cursor:"pointer", color:C.accent, fontSize:12, fontWeight:600, padding:0, display:"flex", alignItems:"center", gap:4 }}>
                    {!showInput&&<span>↩</span>} {showInput?"Cancel":"Reply"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showInput&&(
        <div style={{ paddingLeft:64, marginTop:4 }}>
          <ReplyInput placeholder={`Reply to ${reply.pseudonym}...`} onSubmit={handleSubmit} onCancel={()=>setShowInput(false)} submitting={submitting} />
        </div>
      )}

      <OptionsSheet visible={showOptions} onClose={()=>setShowOptions(false)} onEdit={()=>setEditing(true)} onDelete={handleDelete} onCopy={()=>copyToClipboard(reply.text)} onReport={()=>onReport(reply)} isDeleted={isDeleted} isOwner={isOwner} />
      {showUserCard&&<UserProfileCard pseudonym={reply.pseudonym} visible={showUserCard} onClose={()=>setShowUserCard(false)} />}
    </div>
  );
}

// ── Main CommentThread ────────────────────────────────────────────────────

export default function CommentThread({ comment, postId, onReplyAdded, onCommentUpdated, onCommentDeleted }) {
  const { user } = useAuth();
  const [replies,        setReplies]        = useState(comment.replies || []);
  const [showReplies,    setShowReplies]    = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [showAll,        setShowAll]        = useState(false);
  const [showNoNetwork,  setShowNoNetwork]  = useState(false);
  const [showOptions,    setShowOptions]    = useState(false);
  const [editing,        setEditing]        = useState(false);
  const [editText,       setEditText]       = useState(comment.text);
  const [savingEdit,     setSavingEdit]     = useState(false);
  const [commentText,    setCommentText]    = useState(comment.text);
  const [isEdited,       setIsEdited]       = useState(comment.edited || false);
  const [isDeleted,      setIsDeleted]      = useState(comment.deleted || false);
  const [showUserCard,   setShowUserCard]   = useState(false);
  const [showReportModal,setShowReportModal]= useState(false);
  const [reportTarget,   setReportTarget]   = useState(null);

  const currentUserId = user?.id || user?._id;
  const isOwner       = comment.author === currentUserId || comment.author?.toString() === currentUserId;
  const activeReplies = replies.filter(r => !r.deleted);
  const PREVIEW_COUNT = 2;
  const visibleReplies = showAll ? replies : replies.slice(0, PREVIEW_COUNT);
  const hiddenCount    = activeReplies.length - PREVIEW_COUNT;
  const totalReplies   = comment.repliesCount ?? activeReplies.length;

  useEffect(() => { setReplies(comment.replies||[]); setCommentText(comment.text); setIsEdited(comment.edited||false); setIsDeleted(comment.deleted||false); }, [comment]);

  const handleAddReply = async (text, replyingTo = null) => {
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments/${comment._id}/replies`, { text, replyingTo });
      if (onReplyAdded) onReplyAdded(comment._id, res.data.reply);
      setReplies(prev => [...prev, res.data.reply]);
      setShowReplies(true); setShowAll(true); setShowReplyInput(false);
    } catch (e) { alert(e.response?.data?.message||"Could not add reply."); }
    finally { setSubmitting(false); }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()||editText.trim()===commentText) { setEditing(false); return; }
    setSavingEdit(true);
    try {
      await api.put(`/posts/${postId}/comments/${comment._id}`, { text: editText.trim() });
      setCommentText(editText.trim()); setIsEdited(true);
      if (onCommentUpdated) onCommentUpdated(comment._id, editText.trim());
      setEditing(false);
    } catch (e) { alert(e.response?.data?.message||"Could not update comment."); }
    finally { setSavingEdit(false); }
  };

  const handleDeleteComment = async () => {
    if (!confirm("Delete this comment? This cannot be undone.")) return;
    try {
      await api.delete(`/posts/${postId}/comments/${comment._id}`);
      setCommentText("This comment was deleted."); setIsDeleted(true);
      if (onCommentDeleted) onCommentDeleted(comment._id);
    } catch { alert("Could not delete comment."); }
  };

  if (isDeleted && activeReplies.length === 0) return null;

  return (
    <div style={{ marginBottom:12 }}>
      {/* Main comment */}
      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
        <Avatar pseudonym={comment.pseudonym} size={34} onClick={()=>comment.pseudonym!==user?.pseudonym&&setShowUserCard(true)} />
        <div style={{ flex:1, backgroundColor:C.inputBg, borderRadius:14, padding:10, border:`1px solid ${C.border}`, opacity:isDeleted?0.55:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
            <span style={{ color:C.accentSoft, fontWeight:600, fontSize:13 }}>{comment.pseudonym}</span>
            {comment.isPostAuthor&&!isDeleted&&<AuthorBadge />}
            <span style={{ color:C.textMuted, fontSize:11, marginLeft:"auto" }}>{timeAgo(comment.createdAt)}</span>
            {!isDeleted&&<button onClick={()=>setShowOptions(true)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textMuted, fontSize:14, padding:"0 0 0 6px" }}>⋯</button>}
          </div>

          {editing ? (
            <InlineEdit value={editText} onChange={setEditText} onSave={handleSaveEdit} onCancel={()=>{setEditing(false);setEditText(commentText)}} saving={savingEdit} />
          ) : (
            <>
              <p style={{ color:isDeleted?C.textMuted:C.text, fontSize:13, lineHeight:1.6, marginBottom:6, fontStyle:isDeleted?"italic":"normal", margin:"0 0 6px" }}>{commentText}</p>
              {isEdited&&!isDeleted&&<p style={{ color:C.textMuted, fontSize:10, fontStyle:"italic", margin:"0 0 4px" }}>edited</p>}
              {!isDeleted&&(
                <button onClick={()=>setShowReplyInput(!showReplyInput)} style={{ background:"none", border:"none", cursor:"pointer", color:C.accent, fontSize:12, fontWeight:600, padding:0, display:"flex", alignItems:"center", gap:4 }}>
                  {!showReplyInput&&<span>↩</span>} {showReplyInput?"Cancel":"Reply"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showReplyInput&&(
        <div style={{ paddingLeft:44, marginTop:6 }}>
          <ReplyInput placeholder={`Reply to ${comment.pseudonym}...`} onSubmit={text=>handleAddReply(text,comment.pseudonym)} onCancel={()=>setShowReplyInput(false)} submitting={submitting} />
        </div>
      )}

      {/* Toggle replies */}
      {totalReplies > 0 && (
        <button onClick={()=>{setShowReplies(!showReplies);if(showReplies)setShowAll(false)}}
          style={{ display:"flex", alignItems:"center", gap:8, paddingLeft:44, marginTop:6, background:"none", border:"none", cursor:"pointer", color:C.accent, fontSize:12, fontWeight:600 }}>
          <div style={{ height:1, width:24, backgroundColor:C.border }} />
          {showReplies?"Hide replies":`View ${formatCount(totalReplies)} ${totalReplies===1?"reply":"replies"}`}
        </button>
      )}

      {/* Replies */}
      {showReplies && visibleReplies.length > 0 && (
        <div style={{ paddingLeft:44, marginTop:4 }}>
          {visibleReplies.map((reply, index) => (
            <ReplyItem key={reply._id||`${reply.pseudonym}-${index}`}
              reply={reply} postId={postId} commentId={comment._id} currentUserId={currentUserId}
              isLast={index===visibleReplies.length-1&&hiddenCount<=0}
              onReplyToReply={(text,replyingTo)=>handleAddReply(text,replyingTo)}
              onReplyUpdated={(id,text)=>setReplies(prev=>prev.map(r=>r._id===id?{...r,text,edited:true}:r))}
              onReplyDeleted={(id)=>setReplies(prev=>prev.map(r=>r._id===id?{...r,text:"This reply was deleted.",deleted:true}:r))}
              onReport={(reply)=>{setReportTarget({commentId:comment._id,replyId:reply._id,pseudonym:reply.pseudonym,text:reply.text});setShowReportModal(true)}}
            />
          ))}
          {hiddenCount > 0 && !showAll && (
            <button onClick={()=>setShowAll(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 0", background:"none", border:"none", cursor:"pointer", color:C.accent, fontSize:12, fontWeight:500 }}>
              <div style={{ height:1, width:16, backgroundColor:C.border }} />
              View {formatCount(hiddenCount)} more {hiddenCount===1?"reply":"replies"} ›
            </button>
          )}
        </div>
      )}

      <OptionsSheet visible={showOptions} onClose={()=>setShowOptions(false)} onEdit={()=>setEditing(true)} onDelete={handleDeleteComment} onCopy={()=>copyToClipboard(commentText)} onReport={()=>{setReportTarget({commentId:comment._id,replyId:null,pseudonym:comment.pseudonym,text:commentText});setShowReportModal(true)}} isDeleted={isDeleted} isOwner={isOwner} />
      <NoNetworkOverlay visible={showNoNetwork} action="reply" onClose={()=>setShowNoNetwork(false)} onRetry={()=>setShowNoNetwork(false)} />
      {showUserCard&&<UserProfileCard pseudonym={comment.pseudonym} visible={showUserCard} onClose={()=>setShowUserCard(false)} />}
      <ReportSheet visible={showReportModal} onClose={()=>{setShowReportModal(false);setReportTarget(null)}} target={reportTarget} postId={postId} />
    </div>
  );
}

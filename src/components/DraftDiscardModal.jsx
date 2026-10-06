"use client";
// Matches mobile DraftDiscardModal.js — save/discard post modal
const C = { card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", text:"#EDE8F5", textMuted:"#8B7FA8", error:"#D4607A" };

export default function DraftDiscardModal({ visible, mode = "discard", onSave, onLeave, onCancel }) {
  if (!visible) return null;
  const isSaveMode = mode === "save";

  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.65)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50, padding:"0 16px 32px" }}>
      <div style={{ backgroundColor:C.card, borderRadius:24, padding:24, width:"100%", maxWidth:560, border:`1px solid ${C.border}`, textAlign:"center" }}>
        {/* Icon */}
        <div style={{ width:72, height:72, borderRadius:36, backgroundColor:C.border, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:32 }}>
          {isSaveMode ? "✏️" : "🗑️"}
        </div>

        <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, margin:"0 0 8px" }}>
          {isSaveMode ? "Save for later?" : "Discard post?"}
        </h3>
        <p style={{ color:C.textMuted, fontSize:14, lineHeight:1.6, margin:"0 0 24px" }}>
          {isSaveMode ? "Your thought isn't posted yet. Save it to finish later?" : "You have an unfinished post. Do you want to leave and discard it?"}
        </p>

        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={onCancel} style={{ flex:1, padding:14, borderRadius:14, border:`1px solid ${C.border}`, backgroundColor:"transparent", color:C.text, fontSize:14, fontWeight:600, cursor:"pointer" }}>
            Cancel
          </button>
          <button onClick={onLeave} style={{ flex:1, padding:14, borderRadius:14, border:"none", backgroundColor:C.error, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            Leave
          </button>
          {isSaveMode && (
            <button onClick={onSave} style={{ flex:1, padding:14, borderRadius:14, border:"none", backgroundColor:C.accent, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              💜 Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

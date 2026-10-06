"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import HushCircleSpinner from "../../components/HushCircleSpinner";
import Navbar from "../../components/Navbar";
import { MOOD_CONFIG, COLORS as C } from "../../lib/constants";
import { FlameIcon, CheckInIcon, CheckIcon, SendIcon } from "../../components/Icons";
import { getLocalDateString } from "../../utils/time";

const MILESTONE_CFG = {
  3:   { emoji: "🌱", label: "3-Day Streak",         color: "#4CAF8F" },
  7:   { emoji: "🔥", label: "One Week Strong",       color: "#D4A44C" },
  14:  { emoji: "💪", label: "Two Weeks!",            color: "#9B6FD4" },
  30:  { emoji: "🌟", label: "30-Day Milestone",      color: "#C4A3E8" },
  60:  { emoji: "🚀", label: "60 Days — Unstoppable", color: "#FF6B35" },
  100: { emoji: "👑", label: "100 Days — Legendary",  color: "#FFD700" },
};
const STREAK_GOALS = [3,7,14,30,60,100];
const PAGE_SIZE = 10;

export default function CheckInPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [todayCI,     setTodayCI]     = useState(null);
  const [streak,      setStreak]      = useState({ currentStreak: 0, longestStreak: 0, totalDays: 0 });
  const [history,     setHistory]     = useState([]);
  const [historyTotal,setHistoryTotal]= useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoad, setHistoryLoad] = useState(false);
  const [fetching,    setFetching]    = useState(true);
  const [selectedMood,setSelectedMood]= useState(null);
  const [note,        setNote]        = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [milestone,   setMilestone]   = useState(null);

  const totalPages = Math.max(Math.ceil(historyTotal / PAGE_SIZE), 1);

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading]);
  useEffect(() => { if (user) loadAll(); }, [user]);

  const loadHistoryPage = async page => {
    setHistoryLoad(true);
    try {
      const res = await api.get(`/checkin/history?page=${page}&limit=${PAGE_SIZE}`);
      setHistory(res.data.checkIns || []); setHistoryTotal(res.data.total || 0); setHistoryPage(res.data.page || page);
    } catch {}
    finally { setHistoryLoad(false); }
  };

  const loadAll = async () => {
    setFetching(true);
    try {
      const d = getLocalDateString();
      const [tr, sr] = await Promise.all([
        api.get(`/checkin/today?localDate=${d}`).catch(() => ({ data: { checkIn: null } })),
        api.get(`/checkin/streak?localDate=${d}`).catch(() => ({ data: { currentStreak: 0, longestStreak: 0, totalDays: 0 } })),
      ]);
      setTodayCI(tr.data.checkIn); setStreak(sr.data);
      await loadHistoryPage(1);
    } catch {}
    finally { setFetching(false); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedMood || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post("/checkin", { mood: selectedMood, note: note.trim(), localDate: getLocalDateString() });
      setTodayCI(res.data.checkIn); setNote(""); setSelectedMood(null);
      if (res.data.streak) {
        setStreak(res.data.streak);
        if (res.data.streak.hitMilestone) setMilestone(res.data.streak.hitMilestone);
      }
      await loadHistoryPage(1);
    } catch (err) { alert(err.response?.data?.message || "Could not save."); }
    finally { setSubmitting(false); }
  };

  const getMood = key => MOOD_CONFIG[key] || MOOD_CONFIG.sadness;
  const nextGoal  = STREAK_GOALS.find(m => m > streak.currentStreak) || null;
  const progress  = nextGoal ? (streak.currentStreak / nextGoal) * 100 : 100;
  const flameColor = streak.currentStreak >= 30 ? "#FF6B35" : streak.currentStreak >= 14 ? "#D4A44C" : streak.currentStreak >= 7 ? "#9B6FD4" : "#4CAF8F";
  const missedDay  = streak.currentStreak === 0 && streak.totalDays > 0;

  if (loading || !user) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, paddingTop: 56, paddingBottom: 80 }}>
      <Navbar />

      {/* Milestone modal */}
      {milestone && MILESTONE_CFG[milestone] && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}>
          <div style={{ backgroundColor: C.card, borderRadius: 28, padding: 32, maxWidth: 340, width: "100%", textAlign: "center", border: `1.5px solid ${MILESTONE_CFG[milestone].color}66` }}>
            <p style={{ fontSize: 52, margin: "0 0 12px" }}>{MILESTONE_CFG[milestone].emoji}</p>
            <p style={{ color: C.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" }}>You did it!</p>
            <h2 style={{ color: MILESTONE_CFG[milestone].color, fontFamily: "DM Serif Display, Georgia, serif", fontSize: 26, margin: "0 0 12px" }}>{MILESTONE_CFG[milestone].label}</h2>
            <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>{milestone} days of showing up for yourself 💜</p>
            <button onClick={() => setMilestone(null)} style={{ width: "100%", backgroundColor: MILESTONE_CFG[milestone].color, color: "#fff", border: "none", borderRadius: 14, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Keep going 💜</button>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ paddingTop: 16, paddingBottom: 16, marginBottom: 16 }}>
          <h1 style={{ color: C.text, fontFamily: "DM Serif Display, Georgia, serif", fontSize: 28, margin: 0 }}>Daily Check-in</h1>
          <p style={{ color: C.textMuted, fontSize: 13, margin: "4px 0 0" }}>❤️ How are you doing today?</p>
        </div>

        {fetching ? <div style={{ textAlign: "center", padding: 40 }}><Spinner /></div> : (
          <>
            {/* Streak card */}
            <div style={{ backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 20, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                <FlameIcon size={streak.currentStreak >= 30 ? 48 : streak.currentStreak >= 7 ? 40 : 32} color={streak.currentStreak === 0 ? C.textMuted : flameColor} />
                <div>
                  <p style={{ color: streak.currentStreak === 0 ? C.textMuted : flameColor, fontFamily: "DM Serif Display, Georgia, serif", fontSize: 42, margin: 0, lineHeight: 1 }}>{streak.currentStreak}</p>
                  <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>{streak.currentStreak === 0 ? "streak paused" : `day${streak.currentStreak !== 1 ? "s" : ""} streak`}</p>
                </div>
                {missedDay && (
                  <div style={{ marginLeft: "auto", backgroundColor: C.accent + "22", borderRadius: 10, padding: "4px 10px", border: `1px solid ${C.accent}44` }}>
                    <p style={{ color: C.accent, fontSize: 11, fontWeight: 700, margin: 0 }}>Best: {streak.longestStreak} days</p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-around", paddingBottom: 14, borderBottom: `1px solid ${C.border}`, marginBottom: 12 }}>
                {[{ num: streak.totalDays, label: "Total days", color: C.accent }, { num: streak.longestStreak, label: "Best streak", color: C.warning },
                  ...(nextGoal && streak.currentStreak > 0 ? [{ num: nextGoal - streak.currentStreak, label: "To next goal", color: C.success }] : [])
                ].map((s,i) => (
                  <div key={i} style={{ textAlign: "center", flex: 1 }}>
                    <p style={{ color: s.color, fontFamily: "DM Serif Display, Georgia, serif", fontSize: 26, margin: 0 }}>{s.num}</p>
                    <p style={{ color: C.textMuted, fontSize: 11, margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {nextGoal && streak.currentStreak > 0 && (
                <>
                  <div style={{ height: 6, backgroundColor: C.border, borderRadius: 3, marginBottom: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", backgroundColor: flameColor, borderRadius: 3, width: `${Math.min(progress,100)}%`, transition: "width 0.5s ease" }} />
                  </div>
                  <p style={{ color: C.textMuted, fontSize: 11, textAlign: "center", margin: 0 }}>{streak.currentStreak}/{nextGoal} days to next milestone</p>
                </>
              )}

              {missedDay && (
                <div style={{ backgroundColor: C.warning + "11", borderRadius: 12, padding: 12, marginTop: 12, border: `1px solid ${C.warning}33` }}>
                  <p style={{ color: C.warning, fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>Streak paused — your history is safe 💜</p>
                  <p style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.5, margin: 0 }}>All {streak.totalDays} check-ins are still recorded below. Check in today to start a new streak!</p>
                </div>
              )}
            </div>

            {/* Already checked in */}
            {todayCI ? (
              <div style={{ backgroundColor: C.card, borderRadius: 20, padding: 18, marginBottom: 20, border: `1px solid ${C.success}44` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: getMood(todayCI.mood).color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {(() => { const m = getMood(todayCI.mood); const MIcon = m.Icon; return <MIcon size={30} color={m.color} />; })()}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <CheckInIcon size={15} color={C.success} />
                      <p style={{ color: C.success, fontWeight: 700, fontSize: 14, margin: 0 }}>Today's check-in done</p>
                    </div>
                    <p style={{ color: getMood(todayCI.mood).color, fontWeight: 600, fontSize: 13, margin: 0 }}>{getMood(todayCI.mood).label}</p>
                  </div>
                </div>
                {todayCI.note && (
                  <div style={{ backgroundColor: C.bg, borderRadius: 10, padding: 12, border: `1px solid ${C.border}` }}>
                    <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 4px" }}>Your note:</p>
                    <p style={{ color: C.text, fontSize: 13, fontStyle: "italic", margin: 0 }}>"{todayCI.note}"</p>
                  </div>
                )}
                <p style={{ color: C.textMuted, fontSize: 12, textAlign: "center", margin: "12px 0 0" }}>🔥 Come back tomorrow to keep your streak going</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>How are you feeling?</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                  {Object.values(MOOD_CONFIG).map(m => { const MIcon = m.Icon; return (
                    <button key={m.key} type="button" onClick={() => setSelectedMood(m.key)}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px", borderRadius: 14, border: `1.5px solid ${selectedMood === m.key ? m.color : C.border}`, backgroundColor: selectedMood === m.key ? m.color + "18" : C.card, cursor: "pointer", position: "relative" }}>
                      <MIcon size={28} color={selectedMood === m.key ? m.color : C.textMuted} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: selectedMood === m.key ? m.color : C.textMuted, textAlign: "center" }}>{m.label}</span>
                      {selectedMood === m.key && (
                        <div style={{ position: "absolute", top: 5, right: 5, width: 16, height: 16, borderRadius: "50%", backgroundColor: m.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckIcon size={9} color="#fff" />
                        </div>
                      )}
                    </button>
                  );})}</div>

                <p style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Add a note (optional)</p>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What's on your mind today?" maxLength={200} rows={3}
                  style={{ width: "100%", backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", color: C.text, fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
                <p style={{ color: C.textMuted, fontSize: 11, textAlign: "right", margin: "4px 0 20px" }}>{note.length}/200</p>

                <button type="submit" disabled={!selectedMood || submitting}
                  style={{ width: "100%", backgroundColor: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: !selectedMood ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 28 }}>
                  <SendIcon size={14} color="#fff" /> {submitting ? "Saving..." : "Save check-in"}
                </button>
              </form>
            )}

            {/* History */}
            {historyTotal > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <p style={{ color: C.text, fontWeight: 700, fontSize: 15, margin: 0 }}>Your history</p>
                  <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>{historyTotal} check-in{historyTotal !== 1 ? "s" : ""}</p>
                </div>

                {historyLoad ? <div style={{ textAlign: "center", padding: 20 }}><Spinner /></div> : (
                  history.map((item, i) => {
                    const m = getMood(item.mood);
                    const MIcon = m.Icon;
                    return (
                      <div key={item._id || i} style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: C.card, borderRadius: 14, padding: 12, marginBottom: 8, border: `1px solid ${C.border}`, borderLeft: `3px solid ${m.color}` }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: m.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <MIcon size={20} color={m.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: m.color, fontWeight: 700, fontSize: 13, margin: 0 }}>{m.label}</p>
                          {item.note && <p style={{ color: C.textMuted, fontSize: 12, fontStyle: "italic", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{item.note}"</p>}
                        </div>
                        <p style={{ color: C.textMuted, fontSize: 11, margin: 0, flexShrink: 0 }}>
                          {new Date(item.date + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    );
                  })
                )}

                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 14 }}>
                    <button onClick={() => loadHistoryPage(historyPage - 1)} disabled={historyPage <= 1 || historyLoad}
                      style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 16, cursor: "pointer", opacity: historyPage <= 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                    <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Page {historyPage} of {totalPages}</p>
                    <button onClick={() => loadHistoryPage(historyPage + 1)} disabled={historyPage >= totalPages || historyLoad}
                      style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 16, cursor: "pointer", opacity: historyPage >= totalPages ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Spinner() { return <div style={{ width: 28, height: 28, border: `2px solid #9B6FD4`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />; }

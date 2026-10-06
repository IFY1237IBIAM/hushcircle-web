"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import { BackIcon, MapPinIcon, GlobeIcon, ShieldIcon } from "../../components/Icons";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A" };

function formatDate(d) { if (!d) return ""; return new Date(d).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}); }

export default function LoginActivityPage() {
  const router = useRouter(); const { user, loading } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [terminating, setTerminating] = useState(null);

  useEffect(() => { if (!loading&&!user) router.push("/login"); }, [user,loading]);
  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setFetching(true);
    try { const res = await api.get("/auth/sessions"); setSessions(res.data.sessions||[]); }
    catch {}
    finally { setFetching(false); }
  };

  const handleTerminate = async (id) => {
    if (!confirm("Terminate this session?")) return;
    setTerminating(id);
    try { await api.delete(`/auth/sessions/${id}`); setSessions(prev=>prev.filter(s=>s._id!==id)); }
    catch { alert("Could not terminate session."); }
    finally { setTerminating(null); }
  };

  const handleTerminateAll = async () => {
    if (!confirm("Sign out of all other sessions?")) return;
    try {
      await api.delete("/auth/sessions/all-except-current");
      setSessions(prev=>prev.filter(s=>s.current));
    } catch { alert("Could not terminate sessions."); }
  };

  if (loading||!user) return null;
  const others = sessions.filter(s=>!s.current);

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, paddingTop:56, paddingBottom:80 }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>
        <div style={{ paddingTop:16, paddingBottom:8 }}>
          <button onClick={()=>router.back()} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:C.accent, fontSize:14, fontWeight:600, cursor:"pointer", padding:"8px 0 16px" }}>
            <BackIcon size={18} color={C.accent} /> Back
          </button>
          <h1 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:28, margin:0 }}>Login Activity</h1>
          <p style={{ color:C.textMuted, fontSize:13, margin:"4px 0 0" }}>Devices and sessions signed into your account</p>
        </div>

        {fetching ? <div style={{ textAlign:"center", padding:40 }}><Spinner /></div> : (
          <>
            {/* Current session */}
            {sessions.filter(s=>s.current).map(s=>(
              <div key={s._id} style={{ marginTop:20, marginBottom:8 }}>
                <p style={{ color:C.textMuted, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.6, marginBottom:8 }}>This device</p>
                <SessionCard s={s} onTerminate={null} C={C} />
              </div>
            ))}

            {/* Other sessions */}
            {others.length>0 && (
              <div style={{ marginTop:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <p style={{ color:C.textMuted, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.6, margin:0 }}>Other sessions ({others.length})</p>
                  <button onClick={handleTerminateAll} style={{ color:C.error, fontSize:12, fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>Sign out all</button>
                </div>
                {others.map(s=>(
                  <SessionCard key={s._id} s={s} onTerminate={()=>handleTerminate(s._id)} terminating={terminating===s._id} C={C} />
                ))}
              </div>
            )}

            {sessions.length===0 && (
              <div style={{ textAlign:"center", padding:60 }}>
                <div style={{ width:70, height:70, borderRadius:35, backgroundColor:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                  <ShieldIcon size={32} color={C.textMuted} />
                </div>
                <p style={{ color:C.textMuted, fontSize:14 }}>No login activity found.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SessionCard({ s, onTerminate, terminating, C }) {
  return (
    <div style={{ backgroundColor:C.card, borderRadius:16, padding:16, marginBottom:10, border:`1px solid ${s.current?C.accent+"44":C.border}` }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ color:C.text, fontWeight:700, fontSize:14 }}>{s.deviceName||"Unknown device"}</span>
            {s.current && <span style={{ backgroundColor:C.success+"22", color:C.success, borderRadius:8, padding:"2px 7px", fontSize:10, fontWeight:700 }}>Current</span>}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}><GlobeIcon size={12} color={C.textMuted} /><span style={{ color:C.textMuted, fontSize:12 }}>{s.deviceOS||"Web"}</span></div>
            {s.location && <div style={{ display:"flex", alignItems:"center", gap:5 }}><MapPinIcon size={12} color={C.textMuted} /><span style={{ color:C.textMuted, fontSize:12 }}>{s.location}</span></div>}
            {s.ipAddress && <span style={{ color:C.textMuted, fontSize:12 }}>{s.ipAddress}</span>}
          </div>
          <p style={{ color:C.textMuted, fontSize:11, margin:"6px 0 0" }}>{s.current?"Active now":formatDate(s.lastUsed||s.createdAt)}</p>
        </div>
        {onTerminate && (
          <button onClick={onTerminate} disabled={terminating} style={{ backgroundColor:C.error+"11", color:C.error, border:`1px solid ${C.error}44`, borderRadius:10, padding:"7px 12px", fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>
            {terminating?"...":"Sign out"}
          </button>
        )}
      </div>
    </div>
  );
}
function Spinner() { return <div style={{ width:28, height:28, border:"2px solid #9B6FD4", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />; }

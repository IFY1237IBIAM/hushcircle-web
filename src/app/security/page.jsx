"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import { BackIcon, ShieldIcon, LockIcon, EyeIcon, EyeOffIcon } from "../../components/Icons";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A", warning:"#D4A44C", inputBg:"#0F0A1E" };
const PIN_LENGTH = 6;

function PinInput({ length = PIN_LENGTH, value, onChange }) {
  const refs = useRef([]);

  const pins = value
    .split("")
    .concat(Array(length).fill(""))
    .slice(0, length);

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);

    if (!digit) {
      const next = [...pins];
      next[i] = "";
      onChange(next.join(""));
      return;
    }

    const next = [...pins];
    next[i] = digit;
    onChange(next.join(""));

    if (i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !pins[i] && i > 0) {
      const next = [...pins];
      next[i - 1] = "";
      onChange(next.join(""));
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      {pins.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="password"
          value={digit}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          style={{
            width: 52,
            height: 64,
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            backgroundColor: digit ? C.accent + "11" : C.inputBg,
            border: `1.5px solid ${digit ? C.accent : C.border}`,
            borderRadius: 14,
            outline: "none",
            fontFamily: "monospace",
          }}
        />
      ))}
    </div>
  );
}

export default function SecurityPage() {
  const router = useRouter(); const { user, loading, refreshUser } = useAuth();
  const [status,        setStatus]        = useState(null);
  const [fetching,      setFetching]      = useState(true);
  const [activeSheet,   setActiveSheet]   = useState(null); // "enable"|"disable"|"change"|"recovery"
  const [pin,           setPin]           = useState("");
  const [confirmPin,    setConfirmPin]    = useState("");
  const [currentPin,    setCurrentPin]    = useState("");
  const [currentPw,     setCurrentPw]     = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState("");
  const [recoveryCode,  setRecoveryCode]  = useState("");
  const [showPw,        setShowPw]        = useState(false);

  useEffect(() => { if (!loading&&!user) router.push("/login"); }, [user,loading]);
  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setFetching(true);
    try { const res = await api.get("/two-step/status"); setStatus(res.data); }
    catch {}
    finally { setFetching(false); }
  };

  const handleEnable = async () => {
    if (pin.length<PIN_LENGTH) { setError(`PIN must be ${PIN_LENGTH} digits.`); return; }
    if (pin!==confirmPin) { setError("PINs do not match."); return; }
    if (!currentPw.trim()) { setError("Enter your password."); return; }
    setSubmitting(true); setError("");
    try {
      const res = await api.post("/two-step/enable",{ pin, password:currentPw });
      setRecoveryCode(res.data.recoveryCode||""); setActiveSheet("recovery");
      await load(); refreshUser?.();
    } catch (e) { setError(e.response?.data?.message||"Could not enable two-step."); }
    finally { setSubmitting(false); }
  };

  const handleDisable = async () => {
    if (!currentPin||!currentPw) { setError("Fill in all fields."); return; }
    setSubmitting(true); setError("");
    try {
      await api.post("/two-step/disable",{ pin:currentPin, password:currentPw });
      setActiveSheet(null); setCurrentPin(""); setCurrentPw("");
      await load(); refreshUser?.();
    } catch (e) { setError(e.response?.data?.message||"Could not disable."); }
    finally { setSubmitting(false); }
  };

  const handleChangePin = async () => {
    if (pin.length<PIN_LENGTH) { setError(`New PIN must be ${PIN_LENGTH} digits.`); return; }
    if (pin!==confirmPin) { setError("PINs do not match."); return; }
    setSubmitting(true); setError("");
    try {
      await api.post("/two-step/change-pin",{ currentPin, newPin:pin });
      setActiveSheet(null); setPin(""); setConfirmPin(""); setCurrentPin("");
    } catch (e) { setError(e.response?.data?.message||"Could not change PIN."); }
    finally { setSubmitting(false); }
  };

  const openSheet = (sheet) => { setActiveSheet(sheet); setPin(""); setConfirmPin(""); setCurrentPin(""); setCurrentPw(""); setError(""); setSuccess(""); };
  const closeSheet = () => { setActiveSheet(null); setPin(""); setConfirmPin(""); setCurrentPin(""); setCurrentPw(""); setError(""); };

  if (loading||!user) return null;

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, paddingTop:56, paddingBottom:80 }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>
        <button onClick={()=>router.back()} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:C.accent, fontSize:14, fontWeight:600, cursor:"pointer", padding:"16px 0" }}>
          <BackIcon size={18} color={C.accent} /> Back
        </button>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:28, margin:0 }}>Security</h1>
          <p style={{ color:C.textMuted, fontSize:13, margin:"4px 0 0" }}>Two-step verification & login activity</p>
        </div>

        {fetching ? <div style={{ textAlign:"center", padding:40 }}><Spinner /></div> : (
          <>
            {/* Two-step status card */}
            <div style={{ backgroundColor:C.card, borderRadius:20, padding:20, marginBottom:16, border:`1px solid ${status?.isEnabled?C.success+"44":C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                <div style={{ width:52, height:52, borderRadius:16, backgroundColor:status?.isEnabled?C.success+"22":C.card, border:`1px solid ${status?.isEnabled?C.success+"44":C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <ShieldIcon size={26} color={status?.isEnabled?C.success:C.textMuted} />
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                    <span style={{ color:C.text, fontWeight:700, fontSize:16 }}>Two-step verification</span>
                    <span style={{ backgroundColor:status?.isEnabled?C.success+"22":C.error+"22", color:status?.isEnabled?C.success:C.error, borderRadius:8, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{status?.isEnabled?"ON":"OFF"}</span>
                  </div>
                  <span style={{ color:C.textMuted, fontSize:13 }}>
                    {status?.isEnabled ? "Your account is protected with a PIN" : "Add an extra layer of security"}
                  </span>
                </div>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                {status?.isEnabled ? (
                  <>
                    <button onClick={()=>openSheet("change")} style={{ flex:1, padding:12, borderRadius:12, border:`1px solid ${C.border}`, backgroundColor:C.inputBg, color:C.text, fontSize:13, fontWeight:600, cursor:"pointer" }}>Change PIN</button>
                    <button onClick={()=>openSheet("disable")} style={{ flex:1, padding:12, borderRadius:12, border:`1px solid ${C.error}44`, backgroundColor:C.error+"11", color:C.error, fontSize:13, fontWeight:600, cursor:"pointer" }}>Disable</button>
                  </>
                ) : (
                  <button onClick={()=>openSheet("enable")} style={{ flex:1, padding:14, borderRadius:12, backgroundColor:C.accent, border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Enable two-step 💜</button>
                )}
              </div>
            </div>

            {/* Login activity */}
            <div onClick={()=>router.push("/login-activity")} style={{ backgroundColor:C.card, borderRadius:16, padding:16, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:12, backgroundColor:C.accent+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <LockIcon size={20} color={C.accent} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ color:C.text, fontWeight:700, fontSize:14, margin:0 }}>Login activity</p>
                <p style={{ color:C.textMuted, fontSize:12, margin:0 }}>View devices & active sessions</p>
              </div>
              <span style={{ color:C.textMuted, fontSize:20 }}>›</span>
            </div>
          </>
        )}
      </main>

      {/* Sheet modal */}
      {activeSheet && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.75)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50 }} onClick={closeSheet}>
          <div style={{ backgroundColor:C.card, borderRadius:"24px 24px 0 0", padding:"24px 20px 40px", width:"100%", maxWidth:680, maxHeight:"90vh", overflowY:"auto", border:`1px solid ${C.border}`, borderBottom:"none" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, backgroundColor:C.border, margin:"0 auto 16px" }} />

            {/* RECOVERY CODE */}
            {activeSheet==="recovery" && (
              <div style={{ textAlign:"center" }}>
                <div style={{ width:72, height:72, borderRadius:36, backgroundColor:C.success+"22", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                  <ShieldIcon size={36} color={C.success} />
                </div>
                <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:24, margin:"0 0 8px" }}>Two-step enabled! 🎉</h3>
                <p style={{ color:C.textMuted, fontSize:14, lineHeight:1.65, margin:"0 0 20px" }}>Save this recovery code securely — it lets you bypass two-step if you forget your PIN.</p>
                <div style={{ backgroundColor:C.inputBg, borderRadius:14, padding:16, border:`1.5px solid ${C.accent}55`, marginBottom:20 }}>
                  <p style={{ color:C.accent, fontFamily:"monospace", fontSize:20, fontWeight:700, letterSpacing:4, margin:0 }}>{recoveryCode}</p>
                </div>
                <button onClick={()=>{navigator.clipboard?.writeText(recoveryCode);}} style={{ backgroundColor:C.border, color:C.text, border:"none", borderRadius:12, padding:"10px 20px", fontSize:13, cursor:"pointer", marginBottom:12 }}>Copy code</button>
                <button onClick={closeSheet} style={{ display:"block", width:"100%", padding:14, borderRadius:14, backgroundColor:C.accent, border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>I've saved it — done!</button>
              </div>
            )}

            {/* ENABLE */}
            {activeSheet==="enable" && (
              <>
                <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:24, margin:"0 0 6px" }}>Enable two-step</h3>
                <p style={{ color:C.textMuted, fontSize:13, margin:"0 0 24px" }}>Choose a {PIN_LENGTH}-digit PIN for extra security</p>
                <p style={{ color:C.accentSoft, fontWeight:700, fontSize:12, marginBottom:12 }}>Enter a {PIN_LENGTH}-digit PIN</p>
                <PinInput length={PIN_LENGTH} value={pin} onChange={setPin} />
                <p style={{ color:C.accentSoft, fontWeight:700, fontSize:12, margin:"20px 0 12px" }}>Confirm PIN</p>
                <PinInput length={PIN_LENGTH} value={confirmPin} onChange={setConfirmPin} />
                <p style={{ color:C.accentSoft, fontWeight:700, fontSize:12, margin:"20px 0 8px" }}>Your password</p>
                <div style={{ position:"relative", marginBottom:20 }}>
                  <input type={showPw?"text":"password"} value={currentPw} onChange={e=>setCurrentPw(e.target.value)} placeholder="Enter your password"
                    style={{ width:"100%", backgroundColor:C.inputBg, borderRadius:14, border:`1px solid ${C.border}`, padding:"12px 44px 12px 14px", color:C.text, fontSize:15, outline:"none", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
                  <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" }}>
                    {showPw?<EyeOffIcon size={18} color={C.textMuted} />:<EyeIcon size={18} color={C.textMuted} />}
                  </button>
                </div>
                {error && <p style={{ color:C.error, fontSize:13, marginBottom:12 }}>{error}</p>}
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={closeSheet} style={outBtn}>Cancel</button>
                  <button onClick={handleEnable} disabled={submitting||pin.length<PIN_LENGTH} style={{ ...solBtn, opacity:pin.length<PIN_LENGTH?0.4:1 }}>{submitting?"Enabling...":"Enable 💜"}</button>
                </div>
              </>
            )}

            {/* DISABLE */}
            {activeSheet==="disable" && (
              <>
                <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:24, margin:"0 0 6px" }}>Disable two-step</h3>
                <p style={{ color:C.textMuted, fontSize:13, margin:"0 0 24px" }}>Enter your current PIN and password to confirm</p>
                <p style={{ color:C.accentSoft, fontWeight:700, fontSize:12, marginBottom:12 }}>Current PIN</p>
                <PinInput length={PIN_LENGTH} value={currentPin} onChange={setCurrentPin} />
                <p style={{ color:C.accentSoft, fontWeight:700, fontSize:12, margin:"20px 0 8px" }}>Your password</p>
                <input type="password" value={currentPw} onChange={e=>setCurrentPw(e.target.value)} placeholder="Enter your password"
                  style={{ width:"100%", backgroundColor:C.inputBg, borderRadius:14, border:`1px solid ${C.border}`, padding:"12px 14px", color:C.text, fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:20 }}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
                {error && <p style={{ color:C.error, fontSize:13, marginBottom:12 }}>{error}</p>}
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={closeSheet} style={outBtn}>Cancel</button>
                  <button onClick={handleDisable} disabled={submitting||currentPin.length<PIN_LENGTH} style={{ ...solBtn, backgroundColor:C.error, opacity:currentPin.length<PIN_LENGTH?0.4:1 }}>{submitting?"Disabling...":"Disable"}</button>
                </div>
              </>
            )}

            {/* CHANGE PIN */}
            {activeSheet==="change" && (
              <>
                <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:24, margin:"0 0 6px" }}>Change PIN</h3>
                <p style={{ color:C.textMuted, fontSize:13, margin:"0 0 24px" }}>Enter your current PIN then choose a new one</p>
                <p style={{ color:C.accentSoft, fontWeight:700, fontSize:12, marginBottom:12 }}>Current PIN</p>
                <PinInput length={PIN_LENGTH} value={currentPin} onChange={setCurrentPin} />
                <p style={{ color:C.accentSoft, fontWeight:700, fontSize:12, margin:"20px 0 12px" }}>New PIN</p>
                <PinInput length={PIN_LENGTH} value={pin} onChange={setPin} />
                <p style={{ color:C.accentSoft, fontWeight:700, fontSize:12, margin:"20px 0 12px" }}>Confirm new PIN</p>
                <PinInput length={PIN_LENGTH} value={confirmPin} onChange={setConfirmPin} />
                {error && <p style={{ color:C.error, fontSize:13, margin:"16px 0 0" }}>{error}</p>}
                <div style={{ display:"flex", gap:10, marginTop:20 }}>
                  <button onClick={closeSheet} style={outBtn}>Cancel</button>
                  <button onClick={handleChangePin} disabled={submitting||pin.length<PIN_LENGTH} style={{ ...solBtn, opacity:pin.length<PIN_LENGTH?0.4:1 }}>{submitting?"Saving...":"Save PIN 💜"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() { return <div style={{ width:28, height:28, border:"2px solid #9B6FD4", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />; }
const solBtn = { flex:1, padding:"12px 0", backgroundColor:"#9B6FD4", color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" };
const outBtn = { flex:1, padding:"12px 0", backgroundColor:"transparent", color:"#8B7FA8", border:"1px solid #2D2450", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer" };

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../lib/api";

import Navbar from "../../components/Navbar";
import { BackIcon, ShieldIcon, LockIcon, EyeIcon, EyeOffIcon, AlertIcon, ArrowRightIcon } from "../../components/Icons";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A", warning:"#D4A44C", inputBg:"#0F0A1E" };

const BellIcon      = ({ size=20, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>);
const PseudonymIcon = ({ size=20, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth={2} strokeLinecap="round" /></svg>);
const LangIcon      = ({ size=20, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>);
const SunIcon       = ({ size=20, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke={color} strokeWidth={2} /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth={2} strokeLinecap="round" /></svg>);
const MoonIcon      = ({ size=20, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>);
const TrashIcon     = ({ size=20, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><path d="M10 11v6M14 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>);
const LogoutIcon    = ({ size=20, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" /></svg>);
const KeyIcon       = ({ size=20, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>);
const InfoIcon      = ({ size=20, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} /><line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" /><line x1="12" y1="16" x2="12.01" y2="16" stroke={color} strokeWidth={2.5} strokeLinecap="round" /></svg>);
const ContentIcon   = ({ size=20, color }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>);

const NOTIF_KEYS = [
  { key:"comments",   label:"Comments",    sub:"When someone comments on your post"   },
  { key:"replies",    label:"Replies",      sub:"When someone replies to your comment" },
  { key:"reactions",  label:"Reactions",    sub:"When someone reacts to your post"     },
  { key:"mentions",   label:"Mentions",     sub:"When you're mentioned in a post"      },
  { key:"groupPosts", label:"Circle posts", sub:"New posts in your circles"            },
];
const SENSITIVITY_LEVELS = ["low","medium","strict"];
const COOLDOWN_DAYS = 30;

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: value ? C.accent : C.border,
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
          position: "absolute",
          top: 2,
          left: value ? 22 : 2,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div style={{ marginBottom:28 }}>
      <p style={{ color:C.textMuted, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.7, marginBottom:10, paddingLeft:4 }}>{title}</p>
      <div style={{ backgroundColor:C.card, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>{children}</div>
    </div>
  );
}

function Row({ Icon, iconColor="#9B6FD4", label, sub, right, onClick, danger=false, last=false }) {
  const [hov, setHov] = useState(false);
  const RowIcon = Icon;
  const inner = (
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderBottom:last?"none":`1px solid ${C.border}`, backgroundColor:hov&&onClick?"rgba(255,255,255,0.03)":"transparent", cursor:onClick?"pointer":"default", minHeight:58, transition:"background 0.15s" }}>
      {RowIcon && (
        <div style={{ width:36, height:36, borderRadius:10, backgroundColor:iconColor+"22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <RowIcon size={18} color={iconColor} />
        </div>
      )}
      <div style={{ flex:1 }}>
        <p style={{ color:danger?C.error:C.text, fontSize:14, fontWeight:600, margin:0 }}>{label}</p>
        {sub && <p style={{ color:C.textMuted, fontSize:12, margin:"2px 0 0" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
  if (onClick) return <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>{inner}</div>;
  return inner;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const { isDark, setTheme } = useTheme();   // ← REAL theme switching
  const [settings,       setSettings]       = useState(null);
  const [fetching,       setFetching]       = useState(true);
  const [activeModal,    setActiveModal]    = useState(null);
  const [currentPw,      setCurrentPw]      = useState("");
  const [newPw,          setNewPw]          = useState("");
  const [confirmPw,      setConfirmPw]      = useState("");
  const [delPw,          setDelPw]          = useState("");
  const [newPseudonym,   setNewPseudonym]   = useState("");

  const [saving,         setSaving]         = useState(false);
  const [pwError,        setPwError]        = useState("");
  const [pwSuccess,      setPwSuccess]      = useState("");
  const [showPw,         setShowPw]         = useState(false);
  const [blockedUsers,   setBlockedUsers]   = useState([]);

  useEffect(() => { if (!user) router.push("/login"); else loadSettings(); }, [user]);

  const loadSettings = async () => {
    setFetching(true);
    try {
      const [sr, br] = await Promise.all([
        api.get("/settings").catch(()=>({data:{settings:{}}})),
        api.get("/settings/blocked").catch(()=>({data:{users:[]}})),
      ]);
      setSettings(sr.data.settings||{}); setBlockedUsers(br.data.users||[]);
    } catch {}
    finally { setFetching(false); }
  };

  const updateSetting = async (path, value) => {
    setSettings(prev => {
      const updated = { ...prev };
      const keys = path.split(".");
      let obj = updated;
      for (let i=0;i<keys.length-1;i++) { obj[keys[i]]={...obj[keys[i]]}; obj=obj[keys[i]]; }
      obj[keys[keys.length-1]] = value;
      return updated;
    });
    const body = {};
    const keys = path.split(".");
    if (keys.length===1) body[keys[0]]=value;
    else body[keys[0]]={[keys[1]]:value};
    try { await api.put("/settings",body); } catch { loadSettings(); }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (newPw!==confirmPw) { setPwError("Passwords do not match."); return; }
    if (newPw.length<8) { setPwError("Password must be at least 8 characters."); return; }
    setSaving(true); setPwError(""); setPwSuccess("");
    try {
      await api.put("/settings/change-password",{ currentPassword:currentPw, newPassword:newPw });
      setPwSuccess("Password updated 💜");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(()=>{ setActiveModal(null); setPwSuccess(""); },1500);
    } catch (e) { setPwError(e.response?.data?.message||"Could not update password."); }
    finally { setSaving(false); }
  };

  const handleChangePseudonym = async (e) => {
  e.preventDefault();

  if (!newPseudonym.trim()) {
    setPwError("Enter a new pseudonym.");
    return;
  }

  setSaving(true);
  setPwError("");

  try {
    const res = await api.put("/auth/update-pseudonym", {
      pseudonym: newPseudonym.trim(),
    });

    updateUser({ pseudonym: res.data.pseudonym });

    setPwSuccess("Pseudonym changed 💜");

    setTimeout(() => {
      setActiveModal(null);
      setPwSuccess("");
    }, 1500);
  } catch (e) {
    setPwError(
      e.response?.data?.message || "Could not change pseudonym."
    );
  } finally {
    setSaving(false);
  }
};

  const handleDeleteAccount = async () => {
    if (!delPw) return;
    setSaving(true);
    try {
      await api.delete("/settings/delete-account",{ data:{ password:delPw }});
      await logout(); router.push("/login");
    } catch (e) { alert(e.response?.data?.message||"Could not delete account."); setSaving(false); }
  };

  const handleLogout = async () => {
    if (!confirm("Sign out of HushCircle?")) return;
    await logout(); router.push("/login");
  };

  const handleUnblock = async (userId) => {
    try {
      await api.delete(`/settings/block/${userId}`);
      setBlockedUsers(prev=>prev.filter(u=>u._id!==userId));
    } catch { alert("Could not unblock user."); }
  };

  const openModal = (name) => {
  setActiveModal(name);
  setPwError("");
  setPwSuccess("");
  setCurrentPw("");
  setNewPw("");
  setConfirmPw("");
  setDelPw("");
  setNewPseudonym("");
};
  const closeModal = () => { setActiveModal(null); setPwError(""); setPwSuccess(""); };

  const lastChanged = user?.pseudonymLastChangedAt ? new Date(user.pseudonymLastChangedAt) : null;
  const daysSince   = lastChanged ? Math.floor((Date.now()-lastChanged)/(1000*60*60*24)) : COOLDOWN_DAYS+1;
  const canChange   = daysSince >= COOLDOWN_DAYS;
  const daysLeft    = COOLDOWN_DAYS - daysSince;

  if (!user) return null;

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, paddingTop:56, paddingBottom:80 }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"16px 16px 0" }}>
        <div style={{ paddingTop:16, paddingBottom:20 }}>
          <h1 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:28, margin:0 }}>Settings</h1>
        </div>

        {fetching ? <div style={{ textAlign:"center", padding:40 }}><Spinner /></div> : <>

          <Sec title="Account">
            <Row Icon={PseudonymIcon} iconColor={C.accent} label="Change pseudonym"
              sub={canChange?"Change your anonymous name":`${daysLeft} day${daysLeft!==1?"s":""} until you can change again`}
              right={canChange?<ArrowRightIcon size={16} color={C.textMuted} />:<LockIcon size={14} color={C.textMuted} />}
              onClick={canChange?()=>openModal("pseudonym"):undefined} />
            <Row Icon={KeyIcon} iconColor={C.accentSoft} label="Change password" sub="Update your account password"
              right={<ArrowRightIcon size={16} color={C.textMuted} />} onClick={()=>openModal("password")} />
            <Row Icon={ShieldIcon} iconColor={C.success} label="Security" sub="Two-step verification & login activity"
              right={<ArrowRightIcon size={16} color={C.textMuted} />} onClick={()=>router.push("/security")} last />
          </Sec>

          {/* ── THEME — actually works via ThemeContext ── */}
          <Sec title="Appearance">
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, backgroundColor:C.accent+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <SunIcon size={18} color={C.accent} />
                </div>
                <div><p style={{ color:C.text, fontWeight:600, fontSize:14, margin:0 }}>Theme</p><p style={{ color:C.textMuted, fontSize:12, margin:0 }}>Choose your preferred appearance</p></div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {[{key:"light",Icon:SunIcon},{key:"dark",Icon:MoonIcon}].map(({key,Icon:TIcon})=>{
                  const active = isDark ? key==="dark" : key==="light";
                  return (
                    <button key={key} onClick={()=>setTheme(key)}
                      style={{ flex:1, padding:"10px 0", borderRadius:12, border:`1px solid ${active?C.accent:C.border}`, backgroundColor:active?C.accent+"22":C.inputBg, color:active?C.accent:C.textMuted, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <TIcon size={16} color={active?C.accent:C.textMuted} />
                      {key.charAt(0).toUpperCase()+key.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
            <Row Icon={LangIcon} iconColor={C.accentSoft} label="Language" sub="English (US)" right={<ArrowRightIcon size={16} color={C.textMuted} />} last />
          </Sec>

          <Sec title="Notifications">
            {NOTIF_KEYS.map((item,i)=>(
              <Row key={item.key} Icon={BellIcon} iconColor={C.accentSoft} label={item.label} sub={item.sub}
                right={<Toggle value={settings?.pushNotifications?.[item.key]??true} onChange={v=>updateSetting(`pushNotifications.${item.key}`,v)} />}
                last={i===NOTIF_KEYS.length-1} />
            ))}
          </Sec>

          <Sec title="Privacy">
            <Row Icon={LockIcon} iconColor={C.accentSoft} label="Private profile" sub="Only approved followers see your posts"
              right={<Toggle value={settings?.isProfilePrivate||false} onChange={v=>updateSetting("isProfilePrivate",v)} />} />
            <Row Icon={EyeIcon} iconColor={C.accentSoft} label="Show online status" sub="Let others see when you're active"
              right={<Toggle value={user?.showOnlineStatus!==false} onChange={async v=>{ try { await api.put("/auth/online-status-privacy"); updateUser({ showOnlineStatus:v }); } catch {} }} />} last />
          </Sec>

          <Sec title="Content & Safety">
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, backgroundColor:C.accentSoft+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <ContentIcon size={18} color={C.accentSoft} />
                </div>
                <div><p style={{ color:C.text, fontWeight:600, fontSize:14, margin:0 }}>Content sensitivity</p><p style={{ color:C.textMuted, fontSize:12, margin:0 }}>Filter potentially difficult content</p></div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {SENSITIVITY_LEVELS.map(level=>(
                  <button key={level} onClick={()=>updateSetting("contentSensitivity",level)}
                    style={{ flex:1, padding:"9px 0", borderRadius:10, border:`1px solid ${settings?.contentSensitivity===level?C.accent:C.border}`, backgroundColor:settings?.contentSensitivity===level?C.accent+"22":C.inputBg, color:settings?.contentSensitivity===level?C.accent:C.textMuted, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    {level.charAt(0).toUpperCase()+level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {blockedUsers.length>0 && (
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}` }}>
                <p style={{ color:C.text, fontWeight:600, fontSize:14, margin:"0 0 10px" }}>Blocked users ({blockedUsers.length})</p>
                {blockedUsers.map(u=>(
                  <div key={u._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ color:C.textMuted, fontSize:13 }}>@{u.pseudonym}</span>
                    <button onClick={()=>handleUnblock(u._id)} style={{ backgroundColor:C.success+"11", color:C.success, border:`1px solid ${C.success}44`, borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer" }}>Unblock</button>
                  </div>
                ))}
              </div>
            )}
            <Row Icon={InfoIcon} iconColor={C.textMuted} label="Privacy Policy" right={<ArrowRightIcon size={16} color={C.textMuted} />} onClick={()=>router.push("/privacy")} last />
          </Sec>

          <Sec title="About">
            <Row Icon={InfoIcon} iconColor={C.accentSoft} label="HushCircle Web" sub="Version 1.0.0" last />
          </Sec>

          <Sec title="Account Actions">
            <Row Icon={LogoutIcon} iconColor={C.warning} label="Sign out" sub="Sign out of your account" onClick={handleLogout} />
            <Row Icon={TrashIcon} iconColor={C.error} label="Delete account" sub="Permanently delete all your data" danger onClick={()=>openModal("delete")} right={<ArrowRightIcon size={16} color={C.error} />} last />
          </Sec>
        </>}
      </main>

      {activeModal==="password" && (
        <Sheet onClose={closeModal}>
          <h3 style={sheetTitle}>Change Password</h3>
          <form onSubmit={handleChangePw}>
            {[["Current password",currentPw,setCurrentPw],["New password",newPw,setNewPw],["Confirm new password",confirmPw,setConfirmPw]].map(([label,val,setter],i)=>(
              <div key={i} style={{ marginBottom:14 }}>
                <p style={fieldLabel}>{label}</p>
                <div style={{ position:"relative" }}>
                  <input type={showPw?"text":"password"} value={val} onChange={e=>setter(e.target.value)} placeholder="••••••••"
                    style={{ ...inputSt, paddingRight:44 }} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" }}>
                    {showPw?<EyeOffIcon size={16} color={C.textMuted} />:<EyeIcon size={16} color={C.textMuted} />}
                  </button>
                </div>
              </div>
            ))}
            {pwError   && <p style={{ color:C.error,   fontSize:13, marginBottom:10 }}>{pwError}</p>}
            {pwSuccess && <p style={{ color:C.success, fontSize:13, marginBottom:10 }}>{pwSuccess}</p>}
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button type="button" onClick={closeModal} style={outBtn}>Cancel</button>
              <button type="submit" disabled={saving} style={solBtn}>{saving?"Updating...":"Update 💜"}</button>
            </div>
          </form>
        </Sheet>
      )}

      {activeModal==="pseudonym" && (
        <Sheet onClose={closeModal}>
          <h3 style={sheetTitle}>Change Pseudonym</h3>
          <p style={{ color:C.textMuted, fontSize:13, margin:"0 0 4px" }}>You can only change your pseudonym once every {COOLDOWN_DAYS} days.</p>
          <div style={{ backgroundColor:C.warning+"11", borderRadius:12, padding:12, border:`1px solid ${C.warning}33`, marginBottom:20 }}>
            <p style={{ color:C.warning, fontSize:12, margin:0 }}>⚠️ Your old pseudonym will no longer work and others will see your new one immediately.</p>
          </div>
          <form onSubmit={handleChangePseudonym}>
            <p style={fieldLabel}>New pseudonym (3–20 chars)</p>
            <input value={newPseudonym} onChange={e=>setNewPseudonym(e.target.value)} placeholder="e.g. StarlightHope" maxLength={20}
              style={{ ...inputSt, marginBottom:14 }} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
    
            {pwError   && <p style={{ color:C.error,   fontSize:13, marginBottom:10 }}>{pwError}</p>}
            {pwSuccess && <p style={{ color:C.success, fontSize:13, marginBottom:10 }}>{pwSuccess}</p>}
            <div style={{ display:"flex", gap:10 }}>
              <button type="button" onClick={closeModal} style={outBtn}>Cancel</button>
              <button type="submit" disabled={saving||newPseudonym.length<3} style={{ ...solBtn, opacity:newPseudonym.length<3?0.4:1 }}>{saving?"Saving...":"Change 💜"}</button>
            </div>
          </form>
        </Sheet>
      )}

      {activeModal==="delete" && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:24 }}>
          <div style={{ backgroundColor:C.card, borderRadius:24, padding:28, maxWidth:360, width:"100%", textAlign:"center", border:`1px solid ${C.border}` }}>
            <AlertIcon size={52} color={C.error} />
            <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:24, margin:"16px 0 8px" }}>Delete account?</h3>
            <p style={{ color:C.textMuted, fontSize:13, lineHeight:1.65, margin:"0 0 20px" }}>This permanently deletes all your posts, check-ins, circles, and data. This cannot be undone.</p>
            <p style={{ color:C.error, fontWeight:700, fontSize:12, marginBottom:8 }}>Enter your password to confirm</p>
            <input type="password" value={delPw} onChange={e=>setDelPw(e.target.value)} placeholder="••••••••"
              style={{ ...inputSt, marginBottom:20, textAlign:"center" }} />
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={closeModal} style={outBtn}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={!delPw||saving} style={{ ...solBtn, backgroundColor:C.error, opacity:!delPw?0.4:1 }}>{saving?"Deleting...":"Delete 🗑️"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Sheet({ children, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.75)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50 }} onClick={onClose}>
      <div style={{ backgroundColor:C.card, borderRadius:"24px 24px 0 0", padding:"24px 20px 40px", width:"100%", maxWidth:680, maxHeight:"90vh", overflowY:"auto", border:`1px solid ${C.border}`, borderBottom:"none" }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:2, backgroundColor:C.border, margin:"0 auto 16px" }} />
        {children}
      </div>
    </div>
  );
}


function Spinner() { return <div style={{ width:28, height:28, border:"2px solid #9B6FD4", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />; }
const sheetTitle = { color:"#EDE8F5", fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, margin:"0 0 16px" };
const fieldLabel = { color:"#C4A3E8", fontWeight:600, fontSize:12, margin:"0 0 8px" };
const inputSt    = { width:"100%", backgroundColor:"#0F0A1E", borderRadius:12, border:"1px solid #2D2450", padding:"12px 14px", color:"#EDE8F5", fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const solBtn     = { flex:1, padding:"12px 0", backgroundColor:"#9B6FD4", color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" };
const outBtn     = { flex:1, padding:"12px 0", backgroundColor:"transparent", color:"#8B7FA8", border:"1px solid #2D2450", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer" };

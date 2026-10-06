"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import HushCircleSpinner from "../../components/HushCircleSpinner";
import NoNetworkOverlay from "../../components/NoNetworkOverlay";

const C = {
  bg:"#0F0A1E", card:"#1A1330", border:"#2D2450",
  accent:"#9B6FD4", accentSoft:"#C4A3E8",
  text:"#EDE8F5", textMuted:"#8B7FA8",
  error:"#D4607A", success:"#4CAF8F",
};

// ── SVG Icons matching AuthScreen.js exactly ─────────────────────────────────
const HeartLogoIcon = ({ size=52, color=C.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={color+"44"} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const HeartSmallIcon = ({ size=13, color="#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={color+"55"} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const EyeIcon = ({ size=18, color=C.textMuted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
  </svg>
);
const EyeOffIcon = ({ size=18, color=C.textMuted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1 1l22 22" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const KeyLargeIcon = ({ size=44, color=C.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
      stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const MailOpenIcon = ({ size=44, color=C.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 8.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8.5l9 6 9-6M3 8.5L12 3l9 5.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ShieldIcon = ({ size=44, color=C.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color+"22"} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LockIcon = ({ size=44, color=C.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill={color+"22"} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LifeBuoyIcon = ({ size=44, color=C.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.6} />
    <circle cx="12" cy="12" r="4"  stroke={color} strokeWidth={1.6} />
    <line x1="4.93"  y1="4.93"  x2="9.17"  y2="9.17"  stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <line x1="14.83" y1="9.17"  x2="19.07" y2="4.93"  stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <line x1="4.93"  y1="19.07" x2="9.17"  y2="14.83" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </svg>
);
const LockSmallIcon = ({ size=13, color=C.textMuted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowLeftIcon = ({ size=13, color=C.textMuted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="19" y1="12" x2="5" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="12 19 5 12 12 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── 6-digit code input — matches mobile buildCodeInput exactly ─────────────
function CodeInput({ value, onChange }) {
  const refs = useRef([]);

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);

    if (!digit) {
      const next = [...value];
      next[i] = "";
      onChange(next);
      return;
    }

    const next = [...value];
    next[i] = digit;
    onChange(next);

    if (i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      const next = [...value];
      next[i - 1] = "";
      onChange(next);
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    if (digits.length === 6) {
      onChange(digits);
      refs.current[5]?.focus();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: "center",
        margin: "4px 0",
      }}
    >
      {value.map((digit, i) => (
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
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            width: 46,
            height: 58,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            backgroundColor: digit ? C.accent + "15" : C.card,
            border: `1.5px solid ${digit ? C.accent : C.border}`,
            borderRadius: 12,
            outline: "none",
            fontFamily: "monospace",
          }}
        />
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return <div style={{ marginBottom:16 }}><p style={{ color:C.accentSoft, fontSize:13, fontWeight:500, margin:"0 0 8px" }}>{label}</p>{children}</div>;
}

function SubmitBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width:"100%", backgroundColor:C.accent, border:"none", borderRadius:12, padding:"16px 0", marginTop:8, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.6:1 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
        <HeartSmallIcon size={13} color="#fff" />
        <span style={{ color:"#fff", fontWeight:700, fontSize:16, fontFamily:"Nunito,sans-serif" }}>{children}</span>
      </div>
    </button>
  );
}

function BackLink({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"none", border:"none", cursor:"pointer", marginTop:20, width:"100%" }}>
      <ArrowLeftIcon size={13} color={C.textMuted} />
      <span style={{ color:C.textMuted, fontSize:14, fontFamily:"Nunito,sans-serif" }}>{children}</span>
    </button>
  );
}

function VerifyCard({ Icon, title, subtitle }) {
  return (
    <div style={{ backgroundColor:C.card, borderRadius:16, padding:24, textAlign:"center", border:`1px solid ${C.border}`, marginBottom:28 }}>
      <Icon />
      <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:24, margin:"12px 0 10px" }}>{title}</h3>
      <p style={{ color:C.textMuted, fontSize:14, lineHeight:1.65, margin:0 }}>{subtitle}</p>
    </div>
  );
}

function ErrMsg({ msg }) {
  if (!msg) return null;
  return <p style={{ color:C.error, fontSize:12, margin:"4px 0 0" }}>{msg}</p>;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, setAuth, user, loading } = useAuth();
  const [screen,   setScreen]   = useState("auth");
  const [isLogin,  setIsLogin]  = useState(true);
  const [pseudonym, setPseudonym] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [verifyCode, setVerifyCode]   = useState(Array(6).fill(""));
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [forgotEmail, setForgotEmail]   = useState("");
  const [resetCode,   setResetCode]     = useState(Array(6).fill(""));
  const [resetEmail,  setResetEmail]    = useState("");
  const [newPassword, setNewPassword]   = useState("");
  const [showNewPw,   setShowNewPw]     = useState(false);
  const [twoStepPin,  setTwoStepPin]    = useState(Array(6).fill(""));
  const [twoStepHint, setTwoStepHint]  = useState("");
  const [twoStepEmail,setTwoStepEmail] = useState("");
  const [pendingToken,setPendingToken] = useState(null);
  const [pendingUser, setPendingUser]  = useState(null);
  const [recoverCode,     setRecoverCode]     = useState("");
  const [newRecoverPin,   setNewRecoverPin]   = useState(Array(6).fill(""));
  const [errors,   setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showNoNetwork, setShowNoNetwork] = useState(false);
  const [spinnerVisible, setSpinnerVisible] = useState(false);
  const [spinnerMsg,     setSpinnerMsg]     = useState("");

  useEffect(() => { if (!loading && user) router.push("/feed"); }, [user, loading]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c=>c-1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const withSpinner = async (fn, msg) => {
    setSpinnerMsg(msg); setSpinnerVisible(true);
    try { await fn(); } finally { setSpinnerVisible(false); }
  };

  const switchScreen = (to) => {
    setErrors({});
    if (to === "auth") { setPendingToken(null); setPendingUser(null); setTwoStepPin(Array(6).fill("")); setTwoStepHint(""); setTwoStepEmail(""); setRecoverCode(""); setNewRecoverPin(Array(6).fill("")); }
    setScreen(to);
  };

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "At least 8 characters";
    else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password))
      e.password = "Need uppercase, lowercase, number & symbol";
    if (!isLogin && !pseudonym) e.pseudonym = "Pseudonym is required";
    else if (!isLogin && (pseudonym.length < 3 || pseudonym.length > 20))
      e.pseudonym = "Pseudonym must be 3–20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await withSpinner(async () => {
      try {
        if (isLogin) {
          const result = await login(email, password, { deviceName:"Web Browser", deviceOS:"Web" });
          if (result?.unverified) { setVerifyEmail(email); switchScreen("verify"); return; }
          if (result?.twoStep) {
            setTwoStepEmail(email);
            setTwoStepHint(result.twoStepHint||"");
            setPendingToken(result.pendingToken);
            setPendingUser(result.pendingUser);
            switchScreen("twostep"); return;
          }
          router.push("/feed");
        } else {
          await signup(pseudonym, email, password);
          setVerifyEmail(email); switchScreen("verify");
        }
      } catch (err) { alert(err.response?.data?.message||"Something went wrong. Try again."); }
    }, isLogin ? "Signing you in..." : "Creating your space...");
  };

  const handleVerify = async () => {
    const code = verifyCode.join("");
    if (code.length < 6) { setErrors({ code:"Enter the full 6-digit code" }); return; }
    setVerifyLoading(true);
    try {
      await api.post("/email/verify-email", { code, email:verifyEmail });
      alert("You're verified! Welcome to HushCircle.");
      setVerifyCode(Array(6).fill("")); switchScreen("auth");
    } catch (err) { setErrors({ code:err.response?.data?.message||"Invalid or expired code." }); }
    finally { setVerifyLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await api.post("/email/resend-verification", { email:verifyEmail });
      setResendCooldown(60); alert("A new code has been sent to your email.");
    } catch { alert("Could not resend. Try again shortly."); }
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail||!/^\S+@\S+\.\S+$/.test(forgotEmail)) { setErrors({ forgotEmail:"Enter a valid email address" }); return; }
    await withSpinner(async () => {
      try { await api.post("/email/forgot-password", { email:forgotEmail }); setResetEmail(forgotEmail); switchScreen("reset"); }
      catch { alert("Something went wrong. Try again."); }
    }, "Sending reset code...");
  };

  const handleResetSubmit = async () => {
    const code = resetCode.join("");
    const e = {};
    if (code.length < 6) e.resetCode = "Enter the full 6-digit code";
    if (!newPassword) e.newPassword = "Password is required";
    else if (newPassword.length < 8) e.newPassword = "At least 8 characters";
    else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(newPassword))
      e.newPassword = "Need uppercase, lowercase, number & symbol";
    setErrors(e); if (Object.keys(e).length) return;
    await withSpinner(async () => {
      try {
        await api.post("/email/reset-password", { email:resetEmail, code, newPassword });
        alert("Password reset! Sign in with your new password.");
        setIsLogin(true); setResetCode(Array(6).fill("")); setNewPassword(""); switchScreen("auth");
      } catch (err) { setErrors({ resetCode:err.response?.data?.message||"Invalid or expired code." }); }
    }, "Resetting password...");
  };

  const handleTwoStepVerify = async () => {
    const pin = twoStepPin.join("");
    if (pin.length < 6) { setErrors({ twoStep:"Enter your full 6-digit PIN." }); return; }
    await withSpinner(async () => {
      try {
        await api.post("/two-step/verify", { pin, email:twoStepEmail });
        await setAuth(pendingToken, pendingUser);
        router.push("/feed");
      } catch (err) { setErrors({ twoStep:err.response?.data?.message||"Incorrect PIN. Try again." }); }
    }, "Verifying PIN...");
  };

  const handleTwoStepRecover = async () => {
    const newPin = newRecoverPin.join("");
    if (!recoverCode.trim()) { setErrors({ recover:"Enter your recovery code." }); return; }
    if (newPin.length < 6)   { setErrors({ recover:"Enter a new 6-digit PIN." }); return; }
    await withSpinner(async () => {
      try {
        await api.post("/two-step/recover", { email:twoStepEmail, recoveryCode:recoverCode.trim().toUpperCase(), newPin });
        alert("PIN reset! Sign in again and use your new PIN.");
        setTwoStepPin(Array(6).fill("")); setRecoverCode(""); setNewRecoverPin(Array(6).fill("")); switchScreen("twostep");
      } catch (err) { setErrors({ recover:err.response?.data?.message||"Recovery failed. Check your code." }); }
    }, "Resetting PIN...");
  };

  if (loading || user) return null;

  const inputStyle = (hasErr) => ({ width:"100%", backgroundColor:C.card, border:`1px solid ${hasErr?C.error:C.border}`, borderRadius:12, padding:"14px", color:C.text, fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:"Nunito,sans-serif" });

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:420 }}>

        {/* Header — matches mobile exactly */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <HeartLogoIcon size={52} color={C.accent} />
          <h1 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:42, letterSpacing:1, margin:"8px 0 0" }}>HushCircle</h1>
          <p style={{ color:C.textMuted, fontSize:14, margin:"4px 0 0" }}>A safe space for your heart</p>
        </div>

        {/* ── AUTH SCREEN ── */}
        {screen === "auth" && (
          <>
            <div style={{ display:"flex", backgroundColor:C.card, borderRadius:12, padding:4, marginBottom:28, border:`1px solid ${C.border}` }}>
              {["Sign In","Join"].map((label,i)=>{
                const active = i===0 ? isLogin : !isLogin;
                return (
                  <button key={label} onClick={()=>{ setIsLogin(i===0); setErrors({}); setPendingToken(null); setPendingUser(null); setTwoStepPin(Array(6).fill("")); setTwoStepHint(""); setTwoStepEmail(""); }}
                    style={{ flex:1, paddingTop:10, paddingBottom:10, borderRadius:10, border:"none", backgroundColor:active?C.accent:"transparent", color:active?"#fff":C.textMuted, fontWeight:500, fontSize:14, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {!isLogin && (
              <Field label="Your Anonymous Name">
                <input value={pseudonym} onChange={e=>setPseudonym(e.target.value)} placeholder="e.g. StargazerX, MoonWhisper" autoCapitalize="none"
                  style={inputStyle(!!errors.pseudonym)}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errors.pseudonym?C.error:C.border} />
                <ErrMsg msg={errors.pseudonym} />
                <p style={{ color:C.textMuted, fontSize:12, margin:"4px 0 0" }}>This is how others see you — never your real name</p>
              </Field>
            )}

            <Field label="Email">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"
                style={inputStyle(!!errors.email)}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errors.email?C.error:C.border} />
              <ErrMsg msg={errors.email} />
            </Field>

            <Field label="Password">
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Min 8 chars, uppercase, number, symbol"
                  style={{ ...inputStyle(!!errors.password), paddingRight:44 }}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errors.password?C.error:C.border} />
                <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" }}>
                  {showPw ? <EyeOffIcon size={18} color={C.textMuted} /> : <EyeIcon size={18} color={C.textMuted} />}
                </button>
              </div>
              <ErrMsg msg={errors.password} />
            </Field>

            {isLogin && (
              <>
                <button onClick={()=>{ setForgotEmail(email); switchScreen("forgot"); }}
                  style={{ display:"flex", marginLeft:"auto", background:"none", border:"none", cursor:"pointer", marginBottom:8, marginTop:-8 }}>
                  <span style={{ color:C.accentSoft, fontSize:13, fontFamily:"Nunito,sans-serif" }}>Forgot password?</span>
                </button>
                <p style={{ textAlign:"center", marginTop:8, fontSize:12, color:C.textMuted }}>
                  Lost access to your account entirely?{" "}
                  <span style={{ color:C.accent, fontWeight:700, cursor:"pointer" }}>Get help</span>
                </p>
                <a href="https://www.befrienders.org" target="_blank" rel="noreferrer"
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:20, backgroundColor:"rgba(212,96,122,0.1)", borderRadius:12, padding:"10px 16px", border:"1px solid rgba(212,96,122,0.25)", textDecoration:"none" }}>
                  <span style={{ fontSize:14 }}>🆘</span>
                  <span style={{ color:"#D4607A", fontSize:13, fontWeight:600, fontFamily:"Nunito,sans-serif" }}>In crisis? Find help now</span>
                </a>
              </>
            )}

            <SubmitBtn onClick={handleSubmit} disabled={submitting}>
              {isLogin ? "Enter safely" : "Create my safe space"}
            </SubmitBtn>

            {!isLogin && (
              <div style={{ display:"flex", alignItems:"flex-start", gap:6, marginTop:16, paddingLeft:4 }}>
                <LockSmallIcon size={13} color={C.textMuted} />
                <p style={{ color:C.textMuted, fontSize:12, lineHeight:1.6, margin:0 }}>Your identity is protected. We only store your pseudonym, never your real name.</p>
              </div>
            )}
          </>
        )}

        {/* ── VERIFY EMAIL ── */}
        {screen === "verify" && (
          <>
            <VerifyCard Icon={()=><MailOpenIcon size={44} color={C.accent} />} title="Check your inbox"
              subtitle={<>We sent a 6-digit code to{"\n"}<span style={{ color:C.accentSoft, fontWeight:700 }}>{verifyEmail}</span></>} />
            <CodeInput value={verifyCode} onChange={setVerifyCode} />
            <ErrMsg msg={errors.code} />
            <SubmitBtn onClick={handleVerify} disabled={verifyLoading}>{verifyLoading?"Verifying...":"Verify email"}</SubmitBtn>
            <button onClick={handleResend} disabled={resendCooldown>0}
              style={{ display:"block", width:"100%", marginTop:16, background:"none", border:"none", cursor:"pointer", textAlign:"center" }}>
              <span style={{ color:resendCooldown>0?C.textMuted:C.accentSoft, fontSize:14, fontFamily:"Nunito,sans-serif" }}>
                {resendCooldown>0?`Resend in ${resendCooldown}s`:"Didn't get it? Resend code"}
              </span>
            </button>
            <BackLink onClick={()=>switchScreen("auth")}>Back to sign in</BackLink>
          </>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {screen === "forgot" && (
          <>
            <VerifyCard Icon={()=><KeyLargeIcon size={44} color={C.accent} />} title="Reset password" subtitle="Enter your account email and we'll send a reset code." />
            <Field label="Email address">
              <input type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} placeholder="your@email.com"
                style={inputStyle(!!errors.forgotEmail)}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errors.forgotEmail?C.error:C.border} />
              <ErrMsg msg={errors.forgotEmail} />
            </Field>
            <SubmitBtn onClick={handleForgotSubmit}>Send reset code</SubmitBtn>
            <BackLink onClick={()=>switchScreen("auth")}>Back to sign in</BackLink>
          </>
        )}

        {/* ── RESET PASSWORD ── */}
        {screen === "reset" && (
          <>
            <VerifyCard Icon={()=><ShieldIcon size={44} color={C.accent} />} title="Enter reset code"
              subtitle={<>Sent to <span style={{ color:C.accentSoft, fontWeight:700 }}>{resetEmail}</span>{"\n"}<span style={{ color:C.error, fontSize:12 }}>Expires in 10 minutes</span></>} />
            <CodeInput value={resetCode} onChange={setResetCode} />
            <ErrMsg msg={errors.resetCode} />
            <Field label="New password">
              <div style={{ position:"relative", marginTop:20 }}>
                <input type={showNewPw?"text":"password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, uppercase, number, symbol"
                  style={{ ...inputStyle(!!errors.newPassword), paddingRight:44 }}
                  onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errors.newPassword?C.error:C.border} />
                <button onClick={()=>setShowNewPw(!showNewPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" }}>
                  {showNewPw ? <EyeOffIcon size={18} color={C.textMuted} /> : <EyeIcon size={18} color={C.textMuted} />}
                </button>
              </div>
              <ErrMsg msg={errors.newPassword} />
            </Field>
            <SubmitBtn onClick={handleResetSubmit}>Set new password</SubmitBtn>
            <BackLink onClick={()=>switchScreen("forgot")}>Try a different email</BackLink>
          </>
        )}

        {/* ── TWO-STEP PIN ── */}
        {screen === "twostep" && (
          <>
            <VerifyCard Icon={()=><LockIcon size={44} color={C.accent} />} title="Two-step verification"
              subtitle={<>Enter your 6-digit security PIN.{twoStepHint?<><br/><br/>Hint: "<span style={{ color:C.accentSoft }}>{twoStepHint}</span>"</>:""}</>} />
            <CodeInput value={twoStepPin} onChange={setTwoStepPin} />
            <ErrMsg msg={errors.twoStep} />
            <SubmitBtn onClick={handleTwoStepVerify}>Confirm PIN</SubmitBtn>
            <button onClick={()=>{ setErrors({}); switchScreen("tworecover"); }}
              style={{ display:"block", width:"100%", marginTop:20, background:"none", border:"none", cursor:"pointer", textAlign:"center" }}>
              <span style={{ color:C.accentSoft, fontSize:14, fontFamily:"Nunito,sans-serif" }}>Forgot your PIN? Use recovery code</span>
            </button>
            <BackLink onClick={()=>switchScreen("auth")}>Back to sign in</BackLink>
          </>
        )}

        {/* ── TWO-STEP RECOVERY ── */}
        {screen === "tworecover" && (
          <>
            <VerifyCard Icon={()=><LifeBuoyIcon size={44} color={C.accent} />} title="Recover access"
              subtitle={<>Enter your one-time recovery code and set a new PIN.<br/><span style={{ color:C.error, fontSize:12 }}>Recovery code can only be used once.</span></>} />
            <Field label="Recovery code">
              <input value={recoverCode} onChange={e=>setRecoverCode(e.target.value)} placeholder="e.g. A3F1C9B2D7"
                style={{ ...inputStyle(!!errors.recover), textTransform:"uppercase" }}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=errors.recover?C.error:C.border} />
            </Field>
            <p style={{ color:C.accentSoft, fontSize:13, fontWeight:500, margin:"0 0 4px" }}>New PIN</p>
            <CodeInput value={newRecoverPin} onChange={setNewRecoverPin} />
            <ErrMsg msg={errors.recover} />
            <SubmitBtn onClick={handleTwoStepRecover}>Reset PIN</SubmitBtn>
            <BackLink onClick={()=>{ setErrors({}); switchScreen("twostep"); }}>Back to PIN entry</BackLink>
          </>
        )}
      </div>

      <HushCircleSpinner visible={spinnerVisible} message={spinnerMsg} />
      <NoNetworkOverlay visible={showNoNetwork} action={isLogin?"login":"signup"} onClose={()=>setShowNoNetwork(false)} onRetry={()=>{ setShowNoNetwork(false); handleSubmit(); }} />
    </div>
  );
}

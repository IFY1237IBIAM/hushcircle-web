"use client";
import { useRouter } from "next/navigation";
import { BackIcon } from "../../components/Icons";
import Navbar from "../../components/Navbar";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8" };

const SECTIONS = [
  { title:"What We Collect", icon:"🔍", content:"HushCircle collects only what is necessary: your pseudonym, email address (for authentication), and the content you choose to share — posts, check-ins, and messages. We never collect your real name, phone number, or location unless you explicitly share it in your profile." },
  { title:"How We Use It", icon:"💡", content:"Your data is used solely to power HushCircle features: showing your posts to the community, tracking your check-in streak, enabling group circle conversations, and sending notification alerts. We do not sell your data, period." },
  { title:"Your Anonymity", icon:"🛡️", content:"Your pseudonym is your identity on HushCircle. We never link your account to your real identity in public-facing features. Your email is stored securely and is never visible to other users." },
  { title:"Data Storage", icon:"💾", content:"Your data is stored securely on encrypted servers. Posts, check-ins, and messages are retained while your account is active. When you delete your account, all associated data is permanently and irreversibly removed within 30 days." },
  { title:"Who We Share With", icon:"🤝", content:"We do not share your data with third parties for commercial purposes. We may share anonymised, aggregated data for mental health research — never data that identifies you. We may disclose data if legally required or to prevent imminent harm." },
  { title:"Your Rights", icon:"⚖️", content:"You have the right to access, correct, or delete your data at any time through Settings. You may also request a full export of your data by contacting us at privacy@hushcircle.org." },
  { title:"Cookies & Tracking", icon:"🍪", content:"HushCircle uses minimal, essential cookies for authentication and session management only. We do not use tracking cookies, analytics that identify you, or advertising scripts." },
  { title:"Crisis & Safety", icon:"🆘", content:"If content indicates immediate risk of harm, we may contact emergency services or share information with relevant authorities to protect your safety or the safety of others. This is a last resort, used only in genuine emergencies." },
  { title:"Contact", icon:"📧", content:"Questions about privacy? Email us at privacy@hushcircle.org. We aim to respond within 7 business days." },
];

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, paddingTop:56, paddingBottom:80 }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>
        <button onClick={()=>router.back()} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:C.accent, fontSize:14, fontWeight:600, cursor:"pointer", padding:"16px 0" }}>
          <BackIcon size={18} color={C.accent} /> Back
        </button>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:32, margin:"0 0 8px" }}>Privacy Policy</h1>
          <p style={{ color:C.textMuted, fontSize:13, margin:0 }}>Last updated: January 2025</p>
          <div style={{ backgroundColor:C.accent+"11", borderRadius:14, padding:16, marginTop:16, border:`1px solid ${C.accent}33` }}>
            <p style={{ color:C.accentSoft, fontWeight:700, fontSize:14, margin:"0 0 6px" }}>💜 Our commitment to you</p>
            <p style={{ color:C.textMuted, fontSize:13, lineHeight:1.65, margin:0 }}>HushCircle is built on trust. You share your most vulnerable moments here — and we take that responsibility seriously. Your anonymity and privacy are non-negotiable.</p>
          </div>
        </div>

        {SECTIONS.map((s,i)=>(
          <div key={i} style={{ backgroundColor:C.card, borderRadius:16, padding:20, marginBottom:12, border:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span style={{ fontSize:24 }}>{s.icon}</span>
              <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:18, margin:0 }}>{s.title}</h3>
            </div>
            <p style={{ color:C.textMuted, fontSize:14, lineHeight:1.7, margin:0 }}>{s.content}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

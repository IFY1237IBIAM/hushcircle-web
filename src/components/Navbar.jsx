"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { HomeIcon, SearchIcon, CheckInIcon, BellIcon, UserIcon, GroupsIcon, SettingsIcon, PlusIcon } from "./Icons";

const C = { bg: "#0F0A1E", card: "#1A1330", border: "#2D2450", accent: "#9B6FD4", accentSoft: "#C4A3E8", text: "#EDE8F5", textMuted: "#8B7FA8", error: "#D4607A", tabBar: "#120E22" };

const TABS = [
  { href: "/feed",          Icon: HomeIcon,    label: "Home"     },
  { href: "/search",        Icon: SearchIcon,  label: "Search"   },
  { href: "/groups",        Icon: GroupsIcon,  label: "Circles"  },
  { href: "/checkin",       Icon: CheckInIcon, label: "Check-in" },
  { href: "/notifications", Icon: BellIcon,    label: "Alerts"   },
  { href: "/profile",       Icon: UserIcon,    label: "Me"       },
];

export default function Navbar({ onCreatePost, unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      {/* Top bar */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, backgroundColor: C.card, borderBottom: `1px solid ${C.border}`, height: 56 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          {/* Brand */}
          <button onClick={() => router.push("/feed")} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ color: C.accent, fontSize: 22, fontFamily: "DM Serif Display, Georgia, serif" }}>Hush</span>
            <span style={{ color: C.text,   fontSize: 22, fontFamily: "DM Serif Display, Georgia, serif" }}>Circle</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Create post button — matches mobile + fab */}
            {onCreatePost && (
              <button onClick={onCreatePost}
                style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(155,111,212,0.35)" }}>
                <PlusIcon size={14} color="#fff" /> Share
              </button>
            )}

            {/* Avatar menu */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(!menuOpen)}
                style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: C.accent + "22", border: `1.5px solid ${C.accent}55`, color: C.accentSoft, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif" }}>
                {user?.pseudonym?.[0]?.toUpperCase()}
              </button>

              {menuOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
                  <div style={{ position: "absolute", top: 42, right: 0, width: 210, backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", zIndex: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                      <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 2px" }}>Signed in as</p>
                      <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{user?.pseudonym}</p>
                    </div>
                    <MenuItem label="⚙️  Settings" onClick={() => { router.push("/settings"); setMenuOpen(false); }} />
                    <MenuItem label="👤  My profile"  onClick={() => { router.push("/profile");  setMenuOpen(false); }} />
                    <div style={{ height: 1, backgroundColor: C.border, margin: "4px 0" }} />
                    <MenuItem label="Sign out" onClick={handleLogout} color={C.error} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom tab bar — same as mobile */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, backgroundColor: C.tabBar, borderTop: `1px solid ${C.border}`, height: 64 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", height: "100%", display: "flex", alignItems: "center" }}>
          {TABS.map((tab) => {
            const active  = pathname === tab.href;
            const color   = active ? C.accentSoft : C.textMuted;
            const TabIcon = tab.Icon;
            return (
              <button key={tab.href} onClick={() => router.push(tab.href)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "8px 0", position: "relative" }}>
                {/* Active indicator line at top */}
                {active && <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, backgroundColor: C.accent, borderRadius: "0 0 2px 2px" }} />}

                {/* Notification badge on Alerts */}
                {tab.href === "/notifications" && unreadCount > 0 && (
                  <div style={{ position: "absolute", top: 6, left: "55%", backgroundColor: C.error, color: "#fff", borderRadius: 10, minWidth: 16, height: 16, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}

                <TabIcon size={22} color={color} />
                <span style={{ fontSize: 10, fontWeight: 600, color, fontFamily: "Nunito, sans-serif" }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function MenuItem({ label, onClick, color }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: "100%", textAlign: "left", padding: "11px 16px", backgroundColor: hov ? "rgba(255,255,255,0.04)" : "transparent", border: "none", color: color || "#EDE8F5", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
      {label}
    </button>
  );
}

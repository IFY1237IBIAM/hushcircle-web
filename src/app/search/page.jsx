"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import HushCircleSpinner from "../../components/HushCircleSpinner";
import Navbar from "../../components/Navbar";
import PostCard from "../../components/PostCard";
import NoNetworkOverlay from "../../components/NoNetworkOverlay";
import { SearchIcon, XIcon, ClockIcon, UsersIcon, HashIcon, ArrowRightIcon, MoodHeartbreakIcon, MoodFearIcon, MoodSadnessIcon, MoodStruggleIcon, MoodHopeIcon, MoodJoyIcon, MoodCalmIcon } from "../../components/Icons";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", accentSoft:"#C4A3E8", text:"#EDE8F5", textMuted:"#8B7FA8", success:"#4CAF8F", error:"#D4607A", inputBg:"#0F0A1E" };
const AVATAR_COLORS = ["#9B6FD4","#D4607A","#6B9FD4","#4CAF8F","#D4A44C","#E879F9"];
const avatarColor = p => AVATAR_COLORS[(p?.charCodeAt(0)||0)%AVATAR_COLORS.length];
const RECENT_KEY = "hushcircle_recent_searches";

const TABS = ["Posts","People","Hashtags"];

const MOOD_FILTERS = [
  { key:"all",        label:"All",        Icon:null,                color:C.accent },
  { key:"heartbreak", label:"Heartbreak", Icon:MoodHeartbreakIcon,  color:"#D4607A" },
  { key:"fear",       label:"Anxious",    Icon:MoodFearIcon,        color:"#6B9FD4" },
  { key:"sadness",    label:"Sad",        Icon:MoodSadnessIcon,     color:"#7B8FD4" },
  { key:"struggle",   label:"Struggling", Icon:MoodStruggleIcon,    color:"#D4A44C" },
  { key:"hope",       label:"Hopeful",    Icon:MoodHopeIcon,        color:"#4CAF8F" },
  { key:"joy",        label:"Good",       Icon:MoodJoyIcon,         color:"#9B6FD4" },
  { key:"calm",       label:"Calm",       Icon:MoodCalmIcon,        color:"#C4A3E8" },
];

export default function SearchPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [query,        setQuery]        = useState("");
  const [tab,          setTab]          = useState("Posts");
  const [moodFilter,   setMoodFilter]   = useState("all");
  const [posts,        setPosts]        = useState([]);
  const [people,       setPeople]       = useState([]);
  const [hashtags,     setHashtags]     = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [showNoNetwork,setShowNoNetwork]= useState(false);
  const [recent,       setRecent]       = useState(() => { try { return JSON.parse(localStorage.getItem(RECENT_KEY)||"[]"); } catch { return []; } });
  const debounce = useRef(null);

  useEffect(() => { if (!loading&&!user) router.push("/login"); }, [user, loading]);

  const saveRecent = (q) => {
    const updated = [q,...recent.filter(r=>r!==q)].slice(0,10);
    setRecent(updated); localStorage.setItem(RECENT_KEY,JSON.stringify(updated));
  };

  const doSearch = useCallback(async (q, mood="all") => {
    if (!q.trim()) { setPosts([]); setPeople([]); setHashtags([]); return; }
    setSearching(true);
    try {
      const moodParam = mood!=="all"?`&mood=${mood}`:"";
      const [pr,ur] = await Promise.all([
        api.get(`/posts/search?q=${encodeURIComponent(q)}${moodParam}`).catch(()=>({data:{posts:[]}})),
        api.get(`/auth/search-users?q=${encodeURIComponent(q)}`).catch(()=>({data:{users:[]}})),
      ]);
      setPosts(pr.data.posts||[]);
      setPeople(ur.data.users||[]);
      const tags = {};
      (pr.data.posts||[]).forEach(p=>(p.hashtags||[]).forEach(t=>{ tags[t]=(tags[t]||0)+1; }));
      setHashtags(Object.entries(tags).sort((a,b)=>b[1]-a[1]).map(([tag,count])=>({tag,count})));
      setShowNoNetwork(false);
      saveRecent(q);
    } catch (e) { if (e.message==="Network Error") setShowNoNetwork(true); }
    finally { setSearching(false); }
  }, [recent]);

  const handleChange = (val) => {
    setQuery(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(()=>doSearch(val,moodFilter), 400);
  };

  const handleMoodFilter = (mood) => {
    setMoodFilter(mood);
    if (query.trim()) doSearch(query, mood);
  };

  const hasResults = posts.length>0||people.length>0||hashtags.length>0;

  if (loading||!user) return null;

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, paddingTop:56, paddingBottom:80 }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>

        {/* Search bar */}
        <div style={{ position:"sticky", top:56, zIndex:20, backgroundColor:C.bg, paddingTop:16, paddingBottom:12 }}>
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}>
              <SearchIcon size={17} color={C.textMuted} />
            </div>
            <input value={query} onChange={e=>handleChange(e.target.value)} placeholder="Search posts, people, #hashtags..."
              style={{ width:"100%", backgroundColor:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"13px 40px 13px 44px", color:C.text, fontSize:15, outline:"none", boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=C.accent}
              onBlur={e=>e.target.style.borderColor=C.border} />
            {query && (
              <button onClick={()=>{setQuery("");setPosts([]);setPeople([]);setHashtags([]);}} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" }}>
                <XIcon size={14} color={C.textMuted} />
              </button>
            )}
          </div>

          {/* Mood filter chips */}
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginTop:10, scrollbarWidth:"none" }}>
            {MOOD_FILTERS.map(m=>{
              const MIcon = m.Icon;
              const active = moodFilter===m.key;
              return (
                <button key={m.key} onClick={()=>handleMoodFilter(m.key)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:20, border:`1px solid ${active?m.color:C.border}`, backgroundColor:active?m.color+"22":C.card, color:active?m.color:C.textMuted, fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}>
                  {MIcon && <MIcon size={12} color={active?m.color:C.textMuted} />}
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Tabs */}
          {hasResults && (
            <div style={{ display:"flex", gap:4, marginTop:10 }}>
              {TABS.map(t=>{
                const count = t==="Posts"?posts.length:t==="People"?people.length:hashtags.length;
                return (
                  <button key={t} onClick={()=>setTab(t)}
                    style={{ padding:"6px 14px", borderRadius:10, border:`1px solid ${tab===t?C.accent:C.border}`, backgroundColor:tab===t?C.accent+"22":"transparent", color:tab===t?C.accent:C.textMuted, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    {t} {count>0&&`(${count})`}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent searches */}
        {!query && recent.length>0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ color:C.textMuted, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.6 }}>Recent</span>
              <button onClick={()=>{setRecent([]);localStorage.removeItem(RECENT_KEY);}} style={{ background:"none", border:"none", color:C.textMuted, fontSize:12, cursor:"pointer" }}>Clear all</button>
            </div>
            {recent.map(r=>(
              <div key={r} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                <button onClick={()=>{setQuery(r);doSearch(r,moodFilter);}} style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer" }}>
                  <div style={{ width:32, height:32, borderRadius:16, backgroundColor:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <ClockIcon size={14} color={C.textMuted} />
                  </div>
                  <span style={{ color:C.text, fontSize:14 }}>{r}</span>
                </button>
                <button onClick={()=>{const u=recent.filter(x=>x!==r);setRecent(u);localStorage.setItem(RECENT_KEY,JSON.stringify(u));}} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                  <XIcon size={12} color={C.textMuted} />
                </button>
              </div>
            ))}
          </div>
        )}

        {searching && <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>}

        {/* Results */}
        {!searching && hasResults && (
          <>
            {tab==="Posts" && posts.map(post=>(
              <PostCard key={post._id} post={post}
                onDeleted={id=>setPosts(p=>p.filter(x=>x._id!==id))}
                onHidden={id=>setPosts(p=>p.filter(x=>x._id!==id))}
                onEdited={(id,content,mood)=>setPosts(p=>p.map(x=>x._id===id?{...x,content,mood}:x))}
              />
            ))}

            {tab==="People" && (
              <div>
                {people.map(person=>{
                  const color = avatarColor(person.pseudonym);
                  return (
                    <div key={person._id} onClick={()=>router.push(`/user/${person.pseudonym}`)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", backgroundColor:C.card, borderRadius:14, border:`1px solid ${C.border}`, marginBottom:8, cursor:"pointer" }}>
                      <div style={{ width:44, height:44, borderRadius:22, backgroundColor:color+"22", border:`1.5px solid ${color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:18, color, flexShrink:0 }}>
                        {person.pseudonym?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ color:C.text, fontWeight:700, fontSize:14, margin:0 }}>@{person.pseudonym}</p>
                        {person.bio&&<p style={{ color:C.textMuted, fontSize:12, margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{person.bio}</p>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        {person.totalPosts>0&&<span style={{ color:C.textMuted, fontSize:12 }}>{person.totalPosts} posts</span>}
                        <ArrowRightIcon size={16} color={C.textMuted} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab==="Hashtags" && (
              <div>
                {hashtags.map(({tag,count})=>(
                  <div key={tag} onClick={()=>router.push(`/hashtag/${tag}`)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", backgroundColor:C.card, borderRadius:14, border:`1px solid ${C.border}`, marginBottom:8, cursor:"pointer" }}>
                    <div style={{ width:40, height:40, borderRadius:12, backgroundColor:C.accent+"22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <HashIcon size={18} color={C.accent} />
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ color:C.accent, fontWeight:700, fontSize:15, margin:0 }}>#{tag}</p>
                      <p style={{ color:C.textMuted, fontSize:12, margin:0 }}>{count} post{count!==1?"s":""}</p>
                    </div>
                    <ArrowRightIcon size={16} color={C.textMuted} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* No results */}
        {!searching && query && !hasResults && (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <div style={{ width:80, height:80, borderRadius:40, backgroundColor:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <SearchIcon size={36} color={C.textMuted} />
            </div>
            <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, marginBottom:8 }}>No results found</h3>
            <p style={{ color:C.textMuted, fontSize:14 }}>Try a different search term or mood filter.</p>
          </div>
        )}
      </main>

      <NoNetworkOverlay visible={showNoNetwork} action="feed" onClose={()=>setShowNoNetwork(false)} onRetry={()=>{setShowNoNetwork(false);if(query)doSearch(query,moodFilter);}} />
    </div>
  );
}

function Spinner() { return <div style={{ width:28, height:28, border:"2px solid #9B6FD4", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />; }

"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import Navbar from "../../../components/Navbar";
import PostCard from "../../../components/PostCard";
import { BackIcon, HashIcon } from "../../../components/Icons";

const C = { bg:"#0F0A1E", card:"#1A1330", border:"#2D2450", accent:"#9B6FD4", text:"#EDE8F5", textMuted:"#8B7FA8" };

export default function HashtagPage() {
  const router = useRouter(); const params = useParams();
  const { user, loading } = useAuth();
  const tag = params?.tag;
  const [posts,   setPosts]   = useState([]);
  const [fetching,setFetching]= useState(true);

  useEffect(() => { if (!loading&&!user) router.push("/login"); }, [user,loading]);
  useEffect(() => { if (user&&tag) load(); }, [user,tag]);

  const load = async () => {
    setFetching(true);
    try { const res = await api.get(`/posts/hashtag/${encodeURIComponent(tag)}`); setPosts(res.data.posts||[]); }
    catch {}
    finally { setFetching(false); }
  };

  if (loading||!user) return null;

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, paddingTop:56, paddingBottom:80 }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:"0 auto", padding:"0 16px" }}>
        <button onClick={()=>router.back()} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:C.accent, fontSize:14, fontWeight:600, cursor:"pointer", padding:"16px 0 8px" }}>
          <BackIcon size={18} color={C.accent} /> Back
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
          <div style={{ width:48, height:48, borderRadius:14, backgroundColor:C.accent+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <HashIcon size={24} color={C.accent} />
          </div>
          <div>
            <h1 style={{ color:C.accent, fontFamily:"DM Serif Display,Georgia,serif", fontSize:28, margin:0 }}>#{tag}</h1>
            {!fetching && <p style={{ color:C.textMuted, fontSize:13, margin:0 }}>{posts.length} post{posts.length!==1?"s":""}</p>}
          </div>
        </div>
        {fetching ? <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>
        : posts.length===0 ? (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <p style={{ fontSize:40, marginBottom:12 }}>🔍</p>
            <h3 style={{ color:C.text, fontFamily:"DM Serif Display,Georgia,serif", fontSize:22, marginBottom:8 }}>No posts for #{tag}</h3>
            <p style={{ color:C.textMuted, fontSize:14 }}>Be the first to use this hashtag.</p>
          </div>
        ) : posts.map(post=>(
          <PostCard key={post._id} post={post}
            onDeleted={id=>setPosts(p=>p.filter(x=>x._id!==id))}
            onHidden={id=>setPosts(p=>p.filter(x=>x._id!==id))}
            onEdited={(id,content,mood)=>setPosts(p=>p.map(x=>x._id===id?{...x,content,mood}:x))}
          />
        ))}
      </main>
    </div>
  );
}
function Spinner() { return <div style={{ width:28, height:28, border:"2px solid #9B6FD4", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />; }

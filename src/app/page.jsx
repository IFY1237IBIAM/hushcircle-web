"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import IntroSplash from "../components/IntroSplash";

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    if (!introFinished || loading) return;
    router.push(user ? "/feed" : "/login");
  }, [introFinished, loading, user]);

  return (
    <>
      <div style={{ minHeight: "100vh", backgroundColor: "#0F0A1E" }} />
      <IntroSplash onFinished={() => setIntroFinished(true)} />
    </>
  );
}

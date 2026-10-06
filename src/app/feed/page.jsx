"use client";
// Matches FeedScreen.js exactly — Circle Pulse Bar, LIVE pill, new posts banner, infinite scroll
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import PostCard from "../../components/PostCard";
import CreatePostModal from "../../components/CreatePostModal";
import NoNetworkOverlay from "../../components/NoNetworkOverlay";
import HushCircleSpinner from "../../components/HushCircleSpinner";
import { getLocalDateString } from "../../utils/time";
import { PlusIcon, SparklesIcon, LeafIcon } from "../../components/Icons";

const C = {
  bg: "#0F0A1E",
  card: "#1A1330",
  border: "#2D2450",
  accent: "#9B6FD4",
  accentSoft: "#C4A3E8",
  text: "#EDE8F5",
  textMuted: "#8B7FA8",
  success: "#4CAF8F",
};

// Mood meta matching FeedScreen.js PULSE_MOOD_META
const PULSE_MOOD_META = {
  heartbreak: { color: "#D4607A", emoji: "💔" },
  fear: { color: "#6B9FD4", emoji: "😰" },
  sadness: { color: "#7B8FD4", emoji: "😔" },
  struggle: { color: "#D4A44C", emoji: "😤" },
  hope: { color: "#4CAF8F", emoji: "🌿" },
  joy: { color: "#9B6FD4", emoji: "✨" },
  calm: { color: "#C4A3E8", emoji: "🕊️" },
};

const CIRCLE_SIZE = 62;
const RING_GAP = 3;
const MIN_RING_WIDTH = 2.5;
const MAX_RING_WIDTH = 4;

function getRingWidth(n) {
  return Math.min(MIN_RING_WIDTH + (n - 1) * 0.17, MAX_RING_WIDTH);
}

function CirclePulseBar({ onGroupPress }) {
  const [pulses, setPulses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const localDate = getLocalDateString();

    api
      .get(`/checkin/circle-pulse?localDate=${localDate}`)
      .then((res) => {
        const data = res.data.pulses || [];
        setPulses(data);
        setVisible(data.length > 0);
      })
      .catch(() => setVisible(false))
      .finally(() => setLoading(false));
  }, []);

  if (!visible && !loading) return null;

  return (
    <div
      style={{
        borderBottom: `1px solid ${C.border}`,
        paddingTop: 12,
        paddingBottom: 14,
      }}
    >
      <p
        style={{
          color: C.textMuted,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          margin: "0 0 12px 16px",
        }}
      >
        {loading ? "Circle Pulse" : "Circle Pulse · Today"}
      </p>

      <div
        style={{
          display: "flex",
          gap: 18,
          overflowX: "auto",
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 4,
          scrollbarWidth: "none",
        }}
      >
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: CIRCLE_SIZE + 10,
                    height: CIRCLE_SIZE + 10,
                    borderRadius: "50%",
                    backgroundColor: C.card,
                    opacity: 0.4,
                  }}
                />

                <div
                  style={{
                    width: 50,
                    height: 9,
                    borderRadius: 4,
                    backgroundColor: C.card,
                    opacity: 0.4,
                  }}
                />
              </div>
            ))
          : pulses.map((pulse) => {
              const dominant =
                PULSE_MOOD_META[pulse.dominantMood] ||
                PULSE_MOOD_META.hope;

              const ringWidth = getRingWidth(pulse.totalCheckIns);
              const ringSize =
                CIRCLE_SIZE + RING_GAP * 2 + ringWidth * 2;

              return (
                <div
                  key={pulse.groupId}
                  onClick={() => onGroupPress(pulse.groupId)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: 72,
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      marginBottom: 6,
                      width: ringSize,
                      height: ringSize,
                    }}
                  >
                    {/* SVG ring matching mobile Svg circle */}
                    <svg
                      width={ringSize}
                      height={ringSize}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                    >
                      <circle
                        cx={ringSize / 2}
                        cy={ringSize / 2}
                        r={ringSize / 2 - ringWidth / 2}
                        stroke={dominant.color}
                        strokeWidth={ringWidth}
                        fill="none"
                        opacity={0.9}
                      />
                    </svg>

                    <div
                      style={{
                        width: CIRCLE_SIZE,
                        height: CIRCLE_SIZE,
                        borderRadius: "50%",
                        backgroundColor: dominant.color + "22",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: RING_GAP + ringWidth,
                        fontSize: 28,
                      }}
                    >
                      {pulse.groupIcon}
                    </div>

                    {/* Dominant mood emoji badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: C.card,
                        border: `1.5px solid ${C.bg}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                        fontSize: 11,
                      }}
                    >
                      {dominant.emoji}
                    </div>
                  </div>

                  <p
                    style={{
                      color: C.text,
                      fontSize: 10,
                      fontWeight: 600,
                      textAlign: "center",
                      lineHeight: 1.3,
                      margin: 0,
                      wordBreak: "break-word",
                    }}
                  >
                    {pulse.groupName}
                  </p>
                </div>
              );
            })}
      </div>
    </div>
  );
}

const HIDDEN_KEY_PREFIX = "hushcircle_hidden_posts_";
const LAST_SEEN_KEY_PREFIX = "hushcircle_last_seen_post_";

export default function FeedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showNoNetwork, setShowNoNetwork] = useState(false);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [spinnerVisible, setSpinnerVisible] = useState(false);
  const [spinnerMsg, setSpinnerMsg] = useState("");

  // ── Repost state ────────────────────────────────────────────────────────
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmPostId, setConfirmPostId] = useState(null);
  const [confirmThought, setConfirmThought] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const feedRef = useRef(null);
  const checkingRef = useRef(false);
  const newBtnAnim = useRef(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const userId = user?._id || user?.id || "guest";
  const hiddenKey = `${HIDDEN_KEY_PREFIX}${userId}`;
  const lastSeenKey = `${LAST_SEEN_KEY_PREFIX}${userId}`;

  const getHiddenIds = () => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem(hiddenKey) || "[]")
      );
    } catch {
      return new Set();
    }
  };

  const getLastSeenId = () => {
    try {
      return localStorage.getItem(lastSeenKey);
    } catch {
      return null;
    }
  };

  const saveLastSeenId = (id) => {
    try {
      localStorage.setItem(lastSeenKey, id);
    } catch {}
  };

  const clearLastSeenId = () => {
    try {
      localStorage.removeItem(lastSeenKey);
    } catch {}
  };

  // ── Fetch posts ───────────────────────────────────────────────────────────
  const fetchPosts = useCallback(
    async (refresh = false) => {
      try {
        const hiddenIds = getHiddenIds();

        if (refresh) {
          const lastSeenId = getLastSeenId();
          const hasPostsInMem = posts.length > 0;

          if (lastSeenId && hasPostsInMem) {
            const res = await api.get(
              `/posts?sinceId=${lastSeenId}&limit=20`
            );

            const newPosts = (res.data.posts || []).filter(
              (p) =>
                !hiddenIds.has(p._id) &&
                p.pseudonym !== user?.pseudonym
            );

            if (newPosts.length > 0) {
              saveLastSeenId(newPosts[0]._id);
              setNewPostCount(newPosts.length);

              setPosts((prev) => {
                const ids = new Set(prev.map((p) => p._id));

                return [
                  ...newPosts.filter((p) => !ids.has(p._id)),
                  ...prev,
                ];
              });
            } else {
              setNewPostCount(0);
            }
          } else {
            const res = await api.get("/posts?limit=10");

            const fresh = (res.data.posts || []).filter(
              (p) =>
                !hiddenIds.has(p._id) &&
                p.pseudonym !== user?.pseudonym
            );

            setPosts(fresh);
            setHasMore((res.data.posts || []).length === 10);

            if (fresh.length > 0) {
              saveLastSeenId(fresh[0]._id);
            }
          }
        } else {
          if (!posts.length) return;

          const lastId = posts[posts.length - 1]._id;

          const res = await api.get(
            `/posts?lastId=${lastId}&limit=10`
          );

          const more = (res.data.posts || []).filter(
            (p) =>
              !hiddenIds.has(p._id) &&
              p.pseudonym !== user?.pseudonym
          );

          setPosts((prev) => {
            const ids = new Set(prev.map((p) => p._id));

            return [
              ...prev,
              ...more.filter((p) => !ids.has(p._id)),
            ];
          });

          setHasMore((res.data.posts || []).length === 10);
        }

        setShowNoNetwork(false);
      } catch (e) {
        if (e.message === "Network Error") {
          setShowNoNetwork(true);
        }
      }
    },
    [posts, user]
  );

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    clearLastSeenId();

    setSpinnerMsg("Loading stories...");
    setSpinnerVisible(true);

    fetchPosts(true).finally(() => setSpinnerVisible(false));

    // Poll for new posts every 30s
    const interval = setInterval(async () => {
      if (checkingRef.current) return;

      checkingRef.current = true;

      try {
        const res = await api.get("/posts?limit=1");
        const latest = res.data.posts?.[0];

        if (latest && latest.pseudonym === user?.pseudonym) return;

        const first = posts[0];

        if (
          latest &&
          posts.length > 0 &&
          latest._id !== first?._id
        ) {
          setHasNewPosts(true);
        }
      } catch {} finally {
        checkingRef.current = false;
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setHasNewPosts(false);
    setNewPostCount(0);

    await fetchPosts(true);

    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    await fetchPosts(false);

    setLoadingMore(false);
  };

  const handleSeeNewPosts = async () => {
    setHasNewPosts(false);

    feedRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setRefreshing(true);

    await fetchPosts(true);

    setRefreshing(false);
  };

  const handleHidden = (id) => {
    try {
      const ids = JSON.parse(
        localStorage.getItem(hiddenKey) || "[]"
      );

      if (!ids.includes(id)) {
        ids.push(id);

        localStorage.setItem(
          hiddenKey,
          JSON.stringify(ids)
        );
      }
    } catch {}

    setPosts((prev) =>
      prev.filter((p) => p._id !== id)
    );
  };

  // ── Repost handlers ──────────────────────────────────────────────────────
  const handleReposted = (postId, newCount) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              repostCount: newCount,
              isReposted: true,
            }
          : p
      )
    );
  };

  const handleUnreposted = (postId, newCount) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              repostCount: newCount,
              isReposted: false,
            }
          : p
      )
    );
  };

  const openRepostConfirm = (postId) => {
    setConfirmPostId(postId);
    setConfirmThought("");
    setConfirmVisible(true);
  };

  const handleConfirmRepost = async () => {
    if (!confirmPostId || confirmLoading) return;

    setConfirmLoading(true);

    try {
      const res = await api.post(
        `/posts/${confirmPostId}/repost`,
        {
          thought: confirmThought,
          confirmed: true,
        }
      );

      handleReposted(
        confirmPostId,
        res.data.repostCount
      );

      setConfirmVisible(false);
      setConfirmThought("");
      setConfirmPostId(null);
    } catch (e) {
      alert(
        e.response?.data?.message ||
          "Couldn't repost this story. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleScroll = useCallback(
    (e) => {
      const {
        scrollTop,
        scrollHeight,
        clientHeight,
      } = e.target;

      if (
        scrollHeight - scrollTop - clientHeight <
        400
      ) {
        handleLoadMore();
      }
    },
    [handleLoadMore]
  );

  const handleGroupPress = (groupId) =>
    router.push(`/groups/${groupId}`);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [
      { ...newPost, _isOwn: true },
      ...prev,
    ]);

    setShowCreate(false);

    feedRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (loading || !user) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      {/* ── Header — two-tone wordmark + LIVE pill, matching mobile exactly ── */}
      <div
        style={{
          position: "fixed",
          top: 56,
          left: 0,
          right: 0,
          zIndex: 25,
          backgroundColor: C.card,
          borderBottom: `1px solid ${C.border}`,
          cursor: "pointer",
        }}
        onClick={() => {
          feedRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "14px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            {/* Two-tone wordmark */}
            <h1
              style={{
                fontFamily:
                  "DM Serif Display,Georgia,serif",
                fontSize: 34,
                letterSpacing: -0.5,
                margin: 0,
              }}
            >
              <span style={{ color: C.accent }}>
                Hush
              </span>
              <span style={{ color: C.text }}>
                Circle
              </span>
            </h1>

            {/* LIVE pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                backgroundColor: "#4CAF8F18",
                borderRadius: 20,
                padding: "5px 10px",
                border: "1px solid #4CAF8F44",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#4CAF8F",
                }}
              />

              <span
                style={{
                  color: "#4CAF8F",
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: 1,
                }}
              >
                LIVE
              </span>
            </div>
          </div>

          <p
            style={{
              color: C.textMuted,
              fontSize: 13,
              margin: 0,
            }}
          >
            {refreshing
              ? "Loading new stories…"
              : "You are not alone 💜"}
          </p>
        </div>
      </div>

      {/* Scrollable feed body */}
      <div
        ref={feedRef}
        onScroll={handleScroll}
        style={{
          marginTop: 56 + 82,
          flex: 1,
          overflowY: "auto",
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          {/* ── Circle Pulse Bar ── */}
          <CirclePulseBar
            onGroupPress={handleGroupPress}
          />

          {/* ── New posts banner ── */}
          {hasNewPosts && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 12,
                marginBottom: 4,
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <button
                onClick={handleSeeNewPosts}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: C.accent,
                  borderRadius: 20,
                  border: "none",
                  padding: "10px 20px",
                  cursor: "pointer",
                  boxShadow: `0 4px 20px ${C.accent}66`,
                }}
              >
                <SparklesIcon
                  size={16}
                  color="#fff"
                />

                <span
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    fontFamily: "Nunito,sans-serif",
                  }}
                >
                  {newPostCount > 0
                    ? `${newPostCount} new post${
                        newPostCount > 1 ? "s" : ""
                      }`
                    : "See new posts"}
                </span>
              </button>
            </div>
          )}

          {/* ── Posts ── */}
          <div style={{ padding: 16 }}>
            {refreshing && posts.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 40,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    border: `2px solid ${C.accent}`,
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation:
                      "spin 0.8s linear infinite",
                    margin: "0 auto",
                  }}
                />
              </div>
            )}

            {!refreshing && posts.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  paddingTop: 60,
                  paddingLeft: 32,
                  paddingRight: 32,
                }}
              >
                <div
                  style={{
                    width: 82,
                    height: 82,
                    borderRadius: 41,
                    backgroundColor: C.card,
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <LeafIcon
                    size={42}
                    color={C.accentSoft}
                  />
                </div>

                <h3
                  style={{
                    color: C.text,
                    fontFamily:
                      "DM Serif Display,Georgia,serif",
                    fontSize: 22,
                    marginBottom: 8,
                  }}
                >
                  Be the first to share
                </h3>

                <p
                  style={{
                    color: C.textMuted,
                    fontSize: 14,
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  This is a safe space. Your feelings
                  are valid here.
                </p>
              </div>
            )}

            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleted={(id) =>
                  setPosts((prev) =>
                    prev.filter(
                      (p) => p._id !== id
                    )
                  )
                }
                onHidden={
                  post._isOwn
                    ? undefined
                    : handleHidden
                }
                onEdited={(
                  id,
                  content,
                  mood
                ) =>
                  setPosts((prev) =>
                    prev.map((p) =>
                      p._id === id
                        ? {
                            ...p,
                            content,
                            mood,
                          }
                        : p
                    )
                  )
                }
                onReposted={handleReposted}
                onUnreposted={handleUnreposted}
                onRepostPress={
                  post.allowReposts !== false &&
                  !post._isOwn
                    ? openRepostConfirm
                    : undefined
                }
              />
            ))}

            {loadingMore && (
              <div
                style={{
                  textAlign: "center",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    border: `2px solid ${C.accent}`,
                    borderTopColor:
                      "transparent",
                    borderRadius: "50%",
                    animation:
                      "spin 0.8s linear infinite",
                    margin: "0 auto",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Compose FAB ── */}
      <button
        onClick={() => setShowCreate(true)}
        style={{
          position: "fixed",
          bottom: 80,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: C.accent,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 20px ${C.accent}66`,
          zIndex: 30,
        }}
      >
        <PlusIcon
          size={22}
          color="#fff"
        />
      </button>

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={handlePostCreated}
        />
      )}

      {/* ── Repost Confirmation Modal ── */}
      {confirmVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 100,
          }}
          onClick={() => {
            if (!confirmLoading) {
              setConfirmVisible(false);
            }
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              backgroundColor: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              padding: 24,
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.4)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h3
              style={{
                color: C.text,
                fontFamily:
                  "DM Serif Display, Georgia, serif",
                fontSize: 24,
                margin: "0 0 8px",
              }}
            >
              Repost this story?
            </h3>

            <p
              style={{
                color: C.textMuted,
                fontSize: 14,
                lineHeight: 1.5,
                margin: "0 0 18px",
              }}
            >
              Add a thought to share with your
              repost, or leave it empty.
            </p>

            <textarea
              value={confirmThought}
              onChange={(e) =>
                setConfirmThought(
                  e.target.value
                )
              }
              placeholder="Add a thought..."
              disabled={confirmLoading}
              rows={4}
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                backgroundColor: C.bg,
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 12,
                fontSize: 14,
                fontFamily:
                  "Nunito, sans-serif",
                outline: "none",
                marginBottom: 18,
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                onClick={() =>
                  setConfirmVisible(false)
                }
                disabled={confirmLoading}
                style={{
                  backgroundColor:
                    "transparent",
                  color: C.textMuted,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "10px 18px",
                  cursor: confirmLoading
                    ? "default"
                    : "pointer",
                  fontWeight: 600,
                  opacity:
                    confirmLoading ? 0.5 : 1,
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmRepost}
                disabled={confirmLoading}
                style={{
                  backgroundColor: C.accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 20px",
                  cursor: confirmLoading
                    ? "default"
                    : "pointer",
                  fontWeight: 700,
                  opacity:
                    confirmLoading ? 0.7 : 1,
                }}
              >
                {confirmLoading
                  ? "Reposting..."
                  : "Repost"}
              </button>
            </div>
          </div>
        </div>
      )}

      <HushCircleSpinner
        visible={spinnerVisible}
        message={spinnerMsg}
      />

      <NoNetworkOverlay
        visible={showNoNetwork}
        action="feed"
        onClose={() =>
          setShowNoNetwork(false)
        }
        onRetry={() => {
          setShowNoNetwork(false);
          fetchPosts(true);
        }}
      />
    </div>
  );
}
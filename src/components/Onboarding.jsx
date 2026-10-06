"use client";

import { useEffect, useState } from "react";

const C = {
  bg: "#0F0A1E",
  card: "#1A1330",
  border: "#2D2450",
  accent: "#9B6FD4",
  accentSoft: "#C4A3E8",
  text: "#EDE8F5",
  textMuted: "#8B7FA8",
  error: "#D4607A",
  success: "#4CAF8F",
  warning: "#D4A44C",
  blue: "#6B9FD4",
};

const ONBOARDED_KEY = "hushcircle_onboarded";

const HeartIcon = ({ size = 44, color = C.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={`${color}44`}
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = ({ size = 44, color = C.blue }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1.5" fill={color} />
  </svg>
);

const ShieldIcon = ({ size = 44, color = C.success }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ForbiddenIcon = ({ size = 44, color = C.error }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill={`${color}22`} stroke={color} strokeWidth="1.8" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ModerationIcon = ({ size = 44, color = C.warning }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="11" width="18" height="10" rx="2" fill={`${color}22`} stroke={color} strokeWidth="1.8" />
    <path d="M12 11V3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="3" r="1.5" fill={color} />
    <path d="M8 16h.01M16 16h.01" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const BlockedAccountIcon = ({ size = 44, color = C.error }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" />
    <line x1="2" y1="2" x2="22" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ReadyIcon = ({ size = 44, color = C.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={`${color}33`}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowLeft = ({ size = 15, color = C.textMuted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <polyline points="12 19 5 12 12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRight = ({ size = 15, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <polyline points="12 5 19 12 12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Checkmark = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Bullet = ({ color = C.accent, type = "check" }) => (
  <span
    style={{
      width: 18,
      height: 18,
      borderRadius: 5,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      backgroundColor: `${color}18`,
      border: `1px solid ${color}55`,
      color,
      fontSize: 11,
      fontWeight: 800,
    }}
    aria-hidden="true"
  >
    {type === "x" ? "×" : "✓"}
  </span>
);

const SLIDES = [
  {
    id: "welcome",
    Icon: HeartIcon,
    title: "Welcome to HushCircle",
    subtitle: "A safe space for your heart",
    content:
      "HushCircle is a mental health community where real people share real feelings — anonymously, without judgment. Whatever you are carrying right now, you do not have to carry it alone.",
    color: C.accent,
  },
  {
    id: "anonymous",
    Icon: LockIcon,
    title: "You are anonymous here",
    subtitle: "Your identity is always protected",
    content:
      "You are known only by your pseudonym — never your real name, email, or any personal details. No one can identify you. Share freely and safely.",
    color: C.blue,
    points: [
      "Only your pseudonym is visible to others",
      "Your email is never shown or shared",
      "Your posts cannot be traced back to you",
    ],
  },
  {
    id: "expect",
    Icon: ShieldIcon,
    title: "What we expect from you",
    subtitle: "Keep HushCircle a healing space",
    color: C.success,
    points: [
      "Be kind — everyone here is struggling",
      "Offer support, not solutions",
      "Share honestly from your own experience",
      "Respect every story, even if different from yours",
      "Comment with empathy and care",
    ],
  },
  {
    id: "forbidden",
    Icon: ForbiddenIcon,
    title: "What is not allowed",
    subtitle: "Zero tolerance for harmful behaviour",
    color: C.error,
    forbidden: true,
    points: [
      "Bullying, harassment or targeting others",
      "Promoting violence or self-harm methods",
      "Spam, advertising or fake posts",
      "Sharing anyone's personal information",
      "Hate speech or discrimination of any kind",
      "Explicit or inappropriate sexual content",
    ],
  },
  {
    id: "moderation",
    Icon: ModerationIcon,
    title: "How we keep you safe",
    subtitle: "AI + human moderation working together",
    color: C.warning,
    content:
      "Every post and comment is scanned by our AI moderation system in real time. If your content is flagged or reported by 3 or more users, it will be reviewed by our team.",
    points: [
      "AI scans every post for harmful content",
      "Users can report any post that feels wrong",
      "3+ reports triggers immediate human review",
      "Crisis keywords trigger instant support resources",
    ],
  },
  {
    id: "blocked",
    Icon: BlockedAccountIcon,
    title: "Why accounts get blocked",
    subtitle: "We take safety very seriously",
    color: C.error,
    content:
      "We want everyone to feel safe here. Accounts that repeatedly violate our guidelines will be suspended to protect the community.",
    points: [
      "First violation — warning issued",
      "Second violation — temporary suspension",
      "Third violation — permanent block",
      "Severe violations — immediate permanent ban",
    ],
  },
  {
    id: "ready",
    Icon: ReadyIcon,
    title: "You are ready",
    subtitle: "HushCircle is yours now",
    content:
      "By joining HushCircle you agree to treat this space and everyone in it with kindness, respect and empathy. Together we make this a place where healing is possible.",
    color: C.accent,
  },
];

export default function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [agreed, setAgreed] = useState(false);

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  useEffect(() => {
    setAgreed(false);
  }, [currentSlide]);

  const goTo = (index) => {
    setCurrentSlide(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEnter = () => {
    if (!agreed) return;
    localStorage.setItem(ONBOARDED_KEY, "true");
    onComplete?.();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.bg,
        color: C.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 18px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 22 }}>
          {SLIDES.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to onboarding step ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: i === currentSlide ? 28 : 8,
                height: 8,
                borderRadius: 8,
                border: "none",
                padding: 0,
                backgroundColor:
                  i === currentSlide
                    ? slide.color
                    : i < currentSlide
                    ? `${slide.color}66`
                    : C.border,
                cursor: "pointer",
                transition: "all 180ms ease",
              }}
            />
          ))}
        </div>

        <section
          style={{
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 22,
            padding: "34px clamp(20px, 5vw, 48px) 28px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${slide.color}22`,
                marginBottom: 22,
              }}
            >
              <slide.Icon size={44} color={slide.color} />
            </div>
          </div>

          <h1
            style={{
              color: C.text,
              fontFamily: "DM Serif Display, Georgia, serif",
              fontSize: "clamp(28px, 5vw, 36px)",
              lineHeight: 1.15,
              textAlign: "center",
              margin: "0 0 8px",
            }}
          >
            {slide.title}
          </h1>

          <p
            style={{
              color: slide.color,
              fontFamily: "Nunito, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textAlign: "center",
              margin: "0 0 24px",
            }}
          >
            {slide.subtitle}
          </p>

          {slide.content && (
            <p
              style={{
                color: C.textMuted,
                fontFamily: "Nunito, sans-serif",
                fontSize: 15,
                lineHeight: 1.75,
                textAlign: "center",
                margin: "0 auto 24px",
                maxWidth: 620,
              }}
            >
              {slide.content}
            </p>
          )}

          {slide.points && (
            <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
              {slide.points.map((point) => (
                <div
                  key={point}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: C.bg,
                    border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${slide.color}`,
                    borderRadius: "0 10px 10px 0",
                    padding: "11px 13px",
                  }}
                >
                  <Bullet color={slide.color} type={slide.forbidden ? "x" : "check"} />
                  <span
                    style={{
                      color: C.text,
                      fontFamily: "Nunito, sans-serif",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {point}
                  </span>
                </div>
              ))}
            </div>
          )}

          {isLast && (
            <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
              <button
                type="button"
                onClick={() => setAgreed((value) => !value)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  textAlign: "left",
                  backgroundColor: C.bg,
                  border: `1px solid ${agreed ? C.success : C.border}`,
                  borderRadius: 14,
                  padding: 16,
                  color: C.text,
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    border: `2px solid ${agreed ? C.success : C.border}`,
                    backgroundColor: agreed ? C.success : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {agreed && <Checkmark size={13} />}
                </span>

                <span
                  style={{
                    color: C.text,
                    fontFamily: "Nunito, sans-serif",
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  I have read and agree to HushCircle&apos;s{" "}
                  <a
                    href="/guidelines"
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      color: C.accentSoft,
                      fontWeight: 700,
                      textDecoration: "underline",
                    }}
                  >
                    community guidelines and terms of use
                  </a>
                </span>
              </button>

              <button
                type="button"
                onClick={handleEnter}
                disabled={!agreed}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 14,
                  padding: 17,
                  backgroundColor: agreed ? slide.color : C.border,
                  color: "#fff",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: agreed ? "pointer" : "not-allowed",
                  opacity: agreed ? 1 : 0.55,
                }}
              >
                {agreed ? "✓  Enter HushCircle" : "Please agree to continue"}
              </button>

              <p
                style={{
                  color: C.textMuted,
                  fontFamily: "Nunito, sans-serif",
                  fontSize: 11,
                  lineHeight: 1.55,
                  textAlign: "center",
                  margin: 0,
                }}
              >
                By entering you confirm you are 13 years or older and agree to our
                privacy policy. Your data is never sold or shared with third parties.
              </p>
            </div>
          )}
        </section>

        {!isLast && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 16,
            }}
          >
            <button
              type="button"
              onClick={() => goTo(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              style={{
                border: `1px solid ${C.border}`,
                backgroundColor: "transparent",
                color: C.textMuted,
                borderRadius: 10,
                padding: "10px 16px",
                cursor: currentSlide === 0 ? "not-allowed" : "pointer",
                opacity: currentSlide === 0 ? 0.3 : 1,
                fontFamily: "Nunito, sans-serif",
                fontSize: 14,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <ArrowLeft />
                Back
              </span>
            </button>

            <span
              style={{
                color: C.textMuted,
                fontFamily: "Nunito, sans-serif",
                fontSize: 13,
              }}
            >
              {currentSlide + 1} of {SLIDES.length}
            </span>

            <button
              type="button"
              onClick={() => goTo(Math.min(SLIDES.length - 1, currentSlide + 1))}
              style={{
                border: "none",
                backgroundColor: slide.color,
                color: "#fff",
                borderRadius: 10,
                padding: "10px 20px",
                cursor: "pointer",
                fontFamily: "Nunito, sans-serif",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Next
                <ArrowRight />
              </span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export { ONBOARDED_KEY };

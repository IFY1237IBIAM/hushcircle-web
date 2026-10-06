
import {
  MoodHeartbreakIcon,
  MoodFearIcon,
  MoodSadnessIcon,
  MoodStruggleIcon,
  MoodHopeIcon,
  ReactionCareIcon,
  ReactionHeartIcon,
  ReactionHugIcon,
  ReactionStrongIcon,
  ReactionCryIcon,
  ReactionHopeIcon,
  ReportHarmfulIcon,
  ReportBullyingIcon,
  ReportSpamIcon,
  ReportInappropriateIcon,
  ReportMisinfoIcon,
  ReportOtherIcon,
} from "../components/Icons";

// Matches backend Post mood enum exactly
export const MOOD_CONFIG = {
  heartbreak: {
    key: "heartbreak",
    Icon: MoodHeartbreakIcon,
    label: "Heartbreak",
    color: "#D4607A",
    desc: "Broken, lost",
  },

  fear: {
    key: "fear",
    Icon: MoodFearIcon,
    label: "Anxious",
    color: "#6B9FD4",
    desc: "Scared, overwhelmed",
  },

  sadness: {
    key: "sadness",
    Icon: MoodSadnessIcon,
    label: "Sad",
    color: "#7B8FD4",
    desc: "Heavy, low",
  },

  struggle: {
    key: "struggle",
    Icon: MoodStruggleIcon,
    label: "Struggling",
    color: "#D4A44C",
    desc: "Fighting, tired",
  },

  hope: {
    key: "hope",
    Icon: MoodHopeIcon,
    label: "Hopeful",
    color: "#4CAF8F",
    desc: "Better, lighter",
  },
};

// Matches backend reaction enum exactly
export const REACTIONS = [
  {
    key: "care",
    Icon: ReactionCareIcon,
    iconColor: "#9B6FD4",
    label: "Here for you",
  },

  {
    key: "heart",
    Icon: ReactionHeartIcon,
    iconColor: "#D4607A",
    label: "Love",
  },

  {
    key: "hug",
    Icon: ReactionHugIcon,
    iconColor: "#D4A44C",
    label: "Sending hugs",
  },

  {
    key: "strong",
    Icon: ReactionStrongIcon,
    iconColor: "#4CAF8F",
    label: "Stay strong",
  },

  {
    key: "cry",
    Icon: ReactionCryIcon,
    iconColor: "#6B9FD4",
    label: "I feel this",
  },

  {
    key: "hope",
    Icon: ReactionHopeIcon,
    iconColor: "#4CAF8F",
    label: "There is hope",
  },
];

// Matches mobile REPORT_REASONS exactly
export const REPORT_REASONS = [
  {
    key: "harmful_content",
    Icon: ReportHarmfulIcon,
    iconColor: "#D4A44C",
    label: "Harmful content",
    sub: "Promotes violence or self-harm",
  },

  {
    key: "bullying",
    Icon: ReportBullyingIcon,
    iconColor: "#D4607A",
    label: "Bullying",
    sub: "Targets or harasses someone",
  },

  {
    key: "spam",
    Icon: ReportSpamIcon,
    iconColor: "#8B7FA8",
    label: "Spam",
    sub: "Fake, repetitive or promotional",
  },

  {
    key: "inappropriate",
    Icon: ReportInappropriateIcon,
    iconColor: "#D4607A",
    label: "Inappropriate",
    sub: "Offensive or explicit content",
  },

  {
    key: "misinformation",
    Icon: ReportMisinfoIcon,
    iconColor: "#D4A44C",
    label: "Misinformation",
    sub: "False or misleading information",
  },

  {
    key: "other",
    Icon: ReportOtherIcon,
    iconColor: "#8B7FA8",
    label: "Other",
    sub: "Something else entirely",
  },
];

export const COLORS = {
  bg: "#0F0A1E",
  card: "#1A1330",
  cardAlt: "#201840",
  border: "#2D2450",
  accent: "#9B6FD4",
  accentSoft: "#C4A3E8",
  text: "#EDE8F5",
  textMuted: "#8B7FA8",
  success: "#4CAF8F",
  error: "#D4607A",
  warning: "#D4A44C",
  inputBg: "#0F0A1E",
};

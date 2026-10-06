// Matches mobile OnlineDot.js exactly
export default function OnlineDot({ isOnline, showOnlineStatus = true, size = 12, borderColor = "#1A1330" }) {
  if (!showOnlineStatus) return null;
  if (isOnline === null || isOnline === undefined) return null;
  return (
    <div style={{
      position: "absolute", bottom: 0, right: 0,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: isOnline ? "#4CAF8F" : "#D4607A",
      border: `${size > 10 ? 2 : 1.5}px solid ${borderColor}`,
    }} />
  );
}

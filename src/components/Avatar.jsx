import { useState } from "react";
import { resolveAsset } from "../api/axios";

// Deterministic on-brand colors so a given name always gets the same swatch.
const PALETTE = [
  "#1E293B", // slate
  "#B45309", // amber-700
  "#0F766E", // teal-700
  "#7C2D12", // orange-900
  "#3730A3", // indigo-800
  "#9D174D", // pink-800
  "#166534", // green-800
  "#5B21B6", // violet-800
];

const initialsOf = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const colorOf = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

/**
 * Avatar — shows the user's uploaded photo, or a colored initials badge.
 * Falls back to initials if the image is missing or fails to load.
 */
const Avatar = ({ name = "", src = "", size = 40, ring = false, className = "" }) => {
  const [broken, setBroken] = useState(false);
  const url = resolveAsset(src);
  const showImage = url && !broken;

  const style = {
    width: size,
    height: size,
    fontSize: Math.max(11, size * 0.4),
    backgroundColor: showImage ? "#e2e8f0" : colorOf(name),
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden font-bold text-white select-none shrink-0 ${
        ring ? "ring-2 ring-white/80 shadow-md" : ""
      } ${className}`}
      style={style}
      aria-label={name || "User avatar"}
    >
      {showImage ? (
        <img
          src={url}
          alt={name}
          onError={() => setBroken(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span style={{ fontFamily: "var(--font-display)" }}>{initialsOf(name)}</span>
      )}
    </span>
  );
};

export default Avatar;

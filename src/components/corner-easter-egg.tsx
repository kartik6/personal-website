"use client";

const EASTER_EGG_URL = "https://www.youtube.com/watch?v=Aq5WXmQQooo";

export function CornerEasterEgg() {
  return (
    <a
      className="corner-easter-link"
      href={EASTER_EGG_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Open easter egg video"
      title="Easter Egg"
    >
      🥚
    </a>
  );
}

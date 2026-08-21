import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "overbid.lol — rank is for sale";

// Branded social-card image (also used as twitter:image).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#111111",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="88" height="88" viewBox="0 0 32 32">
            <path d="M4 23 L6 10 L13 16 L16 7 L19 16 L26 10 L28 23 Z" fill="#ff5c00" />
            <rect x="4" y="23" width="24" height="4" rx="1.5" fill="#111111" />
          </svg>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: -4 }}>
            overbid<span style={{ color: "#ff5c00" }}>.lol</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            marginTop: 34,
            fontSize: 40,
            color: "#555555",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ color: "#ff5c00", fontWeight: 700 }}>Rank is for sale.</span>
            <span>Overbid everyone, take #1.</span>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ color: "#888888" }}>…or</span>
            <span style={{ color: "#e11d0f", fontWeight: 700 }}>drag a rival down.</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

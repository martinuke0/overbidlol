import { ImageResponse } from "next/og";
import { getListingById } from "@/lib/db";
import { displayName, usd } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "overbid.lol listing";

export default async function RoastOG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await getListingById(slug);
  const name = l ? displayName(l) : "overbid.lol";
  const rank = l ? Number(l.rank) : 0;
  const bid = l ? usd(l.bid_cents) : "";
  const bio = l?.description || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#0c0c0d",
          color: "#f5f5f5",
          fontFamily: "sans-serif",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 34, fontWeight: 700 }}>
          <svg width="40" height="40" viewBox="0 0 32 32">
            <path d="M4 23 L6 10 L13 16 L16 7 L19 16 L26 10 L28 23 Z" fill="#ff5c00" />
            <rect x="4" y="23" width="24" height="4" rx="1.5" fill="#f5f5f5" />
          </svg>
          <span>
            overbid<span style={{ color: "#ff5c00" }}>.lol</span>
          </span>
        </div>

        {/* main */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {rank > 0 && (
              <span
                style={{
                  display: "flex",
                  fontSize: 40,
                  fontWeight: 800,
                  color: "#0c0c0d",
                  background: "#f5f5f5",
                  borderRadius: 16,
                  padding: "6px 22px",
                }}
              >
                #{rank}
              </span>
            )}
            <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2 }}>{name}</span>
          </div>
          {bid && (
            <div style={{ display: "flex", fontSize: 60, fontWeight: 800, color: "#ff5c00" }}>{bid}</div>
          )}
          {bio && (
            <div style={{ display: "flex", fontSize: 34, color: "#a1a1aa", maxWidth: 1000 }}>{bio}</div>
          )}
        </div>

        {/* footer CTA */}
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
          <span style={{ color: "#ff5c00" }}>Outbid&nbsp;</span>
          <span style={{ color: "#a1a1aa" }}>them — or&nbsp;</span>
          <span style={{ color: "#ff5a4d" }}>drag them down.</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

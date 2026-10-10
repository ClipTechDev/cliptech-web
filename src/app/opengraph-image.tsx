import { ImageResponse } from "next/og";

import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>
          Clip<span style={{ color: "#9b85f5" }}>Tech</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 800, letterSpacing: -4 }}>
            Post the clip.
          </div>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 800, letterSpacing: -4 }}>
            Get paid&nbsp;<span style={{ color: "#9b85f5" }}>per view.</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#a3a3a3" }}>
          Instagram · TikTok · YouTube · X
        </div>
      </div>
    ),
    size
  );
}

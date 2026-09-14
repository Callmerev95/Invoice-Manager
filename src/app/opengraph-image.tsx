import { ImageResponse } from "next/og";
import { APP_NAME, SITE_TAGLINE } from "@/lib/app-meta";

export const alt = `${APP_NAME} — ${SITE_TAGLINE}`;
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
          backgroundColor: "#141d19",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, #1c2622 0%, #141d19 55%)",
          padding: 72,
          color: "#e4ece8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: "#2ec48f",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 34, fontWeight: 700 }}>{APP_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.15, maxWidth: 980 }}>
            {SITE_TAGLINE}
          </div>
          <div style={{ fontSize: 30, color: "#9faea7" }}>
            Dokumen terkunci • Status jelas • Halaman klien resmi
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 26, color: "#9faea7" }}>Develop by</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#2ec48f" }}>
            Callmerev — callmerev.my.id
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

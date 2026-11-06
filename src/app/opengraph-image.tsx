import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}: On This Day in History`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card for every page that does not have a cover picture of its own. */
export default async function OpengraphImage() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public", "logo.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#f8f3ea",
          color: "#1a1815",
          borderBottom: "14px solid #9b3b21",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <img src={logo} alt="" width={132} height={132} style={{ borderRadius: 14 }} />
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: -2 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 48, color: "#9b3b21", fontWeight: 700 }}>
          On This Day in History
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 34, color: "#46453f", maxWidth: 900 }}>
          Short, well-sourced stories about what happened on every date.
        </div>
      </div>
    ),
    size,
  );
}

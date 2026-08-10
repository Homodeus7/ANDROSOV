import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const COLOR = {
  bg: "#0a0a0a",
  fg: "#fafafa",
  muted: "#8a8a8a",
  border: "#262626",
  accent: "#dfe104",
  onAccent: "#000000",
};

const fontsDir = join(process.cwd(), "src/shared/fonts/files");
const [displayFont, monoFont] = await Promise.all([
  readFile(join(fontsDir, "unbounded-700.ttf")),
  readFile(join(fontsDir, "jetbrains-mono-400.ttf")),
]);

type OgFrameProps = {
  eyebrow: string;
  title: string;
  tagline: string;
  footer: string[];
  badge?: string;
};

export function renderOgImage({ eyebrow, title, tagline, footer, badge }: OgFrameProps) {
  // Кегль от длины строки: Satori не умеет ни clamp, ни подгонку по контейнеру
  const titleSize = title.length > 22 ? 84 : title.length > 14 ? 108 : 136;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: COLOR.bg,
          color: COLOR.fg,
          padding: 64,
          border: `4px solid ${COLOR.border}`,
          fontFamily: "JetBrains Mono",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 24, letterSpacing: 4, color: COLOR.muted }}>
            {eyebrow.toUpperCase()}
          </span>
          {badge ? (
            <span
              style={{
                fontSize: 24,
                letterSpacing: 4,
                padding: "8px 20px",
                background: COLOR.accent,
                color: COLOR.onAccent,
              }}
            >
              {badge.toUpperCase()}
            </span>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span
            style={{
              fontFamily: "Unbounded",
              fontSize: titleSize,
              lineHeight: 1.05,
              letterSpacing: -4,
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>
          <span style={{ fontSize: 30, lineHeight: 1.4, color: COLOR.muted, maxWidth: 900 }}>
            {tagline}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 32,
            paddingTop: 28,
            borderTop: `4px solid ${COLOR.accent}`,
            fontSize: 22,
            letterSpacing: 2,
            color: COLOR.muted,
          }}
        >
          {footer.map((entry) => (
            <span key={entry}>{entry.toUpperCase()}</span>
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Unbounded", data: displayFont, style: "normal", weight: 700 },
        { name: "JetBrains Mono", data: monoFont, style: "normal", weight: 400 },
      ],
    },
  );
}

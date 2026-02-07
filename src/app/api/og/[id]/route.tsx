import { ImageResponse } from "next/og";
import { getSpoiler } from "@/lib/redis";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = await getSpoiler(id);

  // 伏字の数を計算
  const spoilerCount = doc?.spoilers?.length || 0;

  // テキストのプレビュー（伏字化）
  let previewText = "";
  if (doc?.content) {
    const sortedSpoilers = [...doc.spoilers].sort((a, b) => a[0] - b[0]);
    let lastEnd = 0;

    sortedSpoilers.forEach((spoiler) => {
      if (spoiler[0] > lastEnd) {
        previewText += doc.content.slice(lastEnd, spoiler[0]);
      }
      previewText += "██████";
      lastEnd = spoiler[1];
    });

    if (lastEnd < doc.content.length) {
      previewText += doc.content.slice(lastEnd);
    }

    // 長すぎる場合は切り詰め
    if (previewText.length > 100) {
      previewText = previewText.slice(0, 100) + "...";
    }
  }

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
          backgroundColor: "#1f2937",
          backgroundImage:
            "linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)",
        }}
      >
        {/* 警告アイコン */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 80,
              marginRight: 20,
            }}
          >
            ⚠️
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: "#fbbf24",
            }}
          >
            ネタバレ注意！
          </div>
        </div>

        {/* 伏字プレビュー */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 1000,
            padding: "0 40px",
            fontSize: 28,
            color: "#9ca3af",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {previewText || "この投稿にはネタバレが含まれています"}
        </div>

        {/* 伏字カウント */}
        <div
          style={{
            display: "flex",
            marginTop: 40,
            padding: "12px 24px",
            backgroundColor: "rgba(251, 191, 36, 0.2)",
            borderRadius: 12,
            border: "2px solid #fbbf24",
          }}
        >
          <span style={{ color: "#fbbf24", fontSize: 24 }}>
            🔒 {spoilerCount}箇所の伏字があります
          </span>
        </div>

        {/* ブランド */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 30,
            right: 40,
            fontSize: 24,
            color: "#6b7280",
          }}
        >
          NSpoiler
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

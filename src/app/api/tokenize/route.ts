import { NextRequest, NextResponse } from "next/server";
import { tokenize, filterNouns, selectRandom } from "@/lib/tokenizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, ratio = 0.3 } = body;

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const tokens = await tokenize(content);
    const nouns = filterNouns(tokens);
    const selected = selectRandom(nouns, ratio);

    // 重複を除去して範囲を返す
    const spoilers = selected.map((t) => [t.start, t.end]);

    return NextResponse.json({ spoilers });
  } catch (error) {
    console.error("Failed to tokenize:", error);
    return NextResponse.json(
      { error: "Failed to tokenize" },
      { status: 500 }
    );
  }
}

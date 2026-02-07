import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { saveSpoiler, SpoilerDocument } from "@/lib/redis";
import { nanoid } from "nanoid";
import { SpoilerTheme } from "@/components/SpoilerViewer";

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, spoilers, theme = "classic" } = body;

    if (!content || !Array.isArray(spoilers)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const id = nanoid(10);
    const doc: SpoilerDocument = {
      id,
      userId: session.user.email,
      content,
      spoilers,
      theme: theme as SpoilerTheme,
      createdAt: Date.now(),
    };

    await saveSpoiler(doc);

    return NextResponse.json({ id, url: `/view/${id}` });
  } catch (error) {
    console.error("Failed to save spoiler:", error);
    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  }
}

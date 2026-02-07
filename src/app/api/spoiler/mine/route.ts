import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getUserSpoilers } from "@/lib/redis";

export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const spoilers = await getUserSpoilers(session.user.email);

    return NextResponse.json({
      spoilers: spoilers.map((doc) => ({
        id: doc.id,
        content: doc.content.slice(0, 100) + (doc.content.length > 100 ? "..." : ""),
        spoilerCount: doc.spoilers.length,
        theme: doc.theme,
        createdAt: doc.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to get user spoilers:", error);
    return NextResponse.json(
      { error: "Failed to get spoilers" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSpoiler, deleteSpoiler } from "@/lib/redis";
import { getServerSession } from "next-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const doc = await getSpoiler(id);

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error("Failed to get spoiler:", error);
    return NextResponse.json(
      { error: "Failed to get" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  const { id } = await params;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const doc = await getSpoiler(id);

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (doc.userId !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteSpoiler(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete spoiler:", error);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ role: "GUEST" });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ role: "USER" });
    }

    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error("Error in auth role endpoint:", error);
    return NextResponse.json({ role: "USER" });
  }
}

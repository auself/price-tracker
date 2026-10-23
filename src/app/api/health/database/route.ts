import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * Minimal connectivity check. Never returns database details or connection strings.
 * This route confirms connectivity only; it does not prove that migrations are applied.
 */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { status: "not_configured", message: "Database connection is not configured." },
      { status: 503 }
    );
  }

  try {
    const sql = getDb();
    await sql`select 1 as connected`;
    return NextResponse.json({ status: "connected" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { status: "unavailable", message: "Database connection failed." },
      { status: 503 }
    );
  }
}

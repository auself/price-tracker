import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const REQUIRED_TABLES = [
  "app_users",
  "company_units",
  "categories",
  "items",
  "suppliers",
  "price_records",
  "price_suggestions",
  "audit_events",
] as const;

/**
 * Checks database connectivity and whether the initial schema is installed.
 * Never returns credentials, SQL errors, or connection details.
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

    const missingTables = await sql`
      select table_name
      from (values
        ('app_users'),
        ('company_units'),
        ('categories'),
        ('items'),
        ('suppliers'),
        ('price_records'),
        ('price_suggestions'),
        ('audit_events')
      ) as required(table_name)
      where to_regclass('public.' || table_name) is null
    `;

    if (missingTables.length > 0) {
      return NextResponse.json(
        {
          status: "schema_missing",
          message: "Database is reachable, but the initial schema is incomplete.",
          missing_tables: missingTables.map((row) => row.table_name),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { status: "connected", schema: "ready" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { status: "unavailable", message: "Database connection failed." },
      { status: 503 }
    );
  }
}

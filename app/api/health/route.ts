import { NextResponse } from "next/server"
import { checkConnection } from "@/app/api/db/init"

export async function GET() {
  try {
    // Check database connection
    const dbStatus = await checkConnection()

    // Check environment variables
    const envStatus = {
      JWT_SECRET: process.env.JWT_SECRET ? "set" : "missing",
      POSTGRES_URL: process.env.POSTGRES_URL ? "set" : "missing",
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: envStatus,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

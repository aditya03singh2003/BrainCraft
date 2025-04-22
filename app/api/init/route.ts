import { NextResponse } from "next/server"
import { initializeDatabase, checkConnection } from "@/app/api/db/init"

export async function GET() {
  try {
    // Check database connection first
    const connectionStatus = await checkConnection()

    if (!connectionStatus.connected) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          details: connectionStatus.error,
        },
        { status: 500 },
      )
    }

    // Initialize database
    await initializeDatabase()

    return NextResponse.json({
      status: "success",
      message: "Database initialized successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error during database initialization",
      },
      { status: 500 },
    )
  }
}

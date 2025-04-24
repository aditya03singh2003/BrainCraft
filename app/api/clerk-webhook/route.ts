import type { WebhookEvent } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { query } from "@/app/api/db/init"

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occurred", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, username, first_name, last_name, image_url } = evt.data

    // Get primary email
    const primaryEmail = email_addresses?.find((email) => email.id === evt.data.primary_email_address_id)

    if (!primaryEmail) {
      return NextResponse.json({ error: "No primary email found" }, { status: 400 })
    }

    try {
      // Insert user into our database
      await query("INSERT INTO users (id, username, email, avatar_url, created_at) VALUES ($1, $2, $3, $4, NOW())", [
        id,
        username || `${first_name || ""}${last_name || ""}`,
        primaryEmail.email_address,
        image_url,
      ])

      // Create initial user stats
      await query(
        "INSERT INTO user_stats (user_id, quizzes_created, quizzes_taken, total_points, average_score) VALUES ($1, 0, 0, 0, 0)",
        [id],
      )

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error creating user in database:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  }

  // Return a 200 response
  return NextResponse.json({ success: true })
}

import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { Webhook } from "svix"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set")
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error: Verification error", { status: 400 })
  }

  const eventType = evt.type

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address
    const name = `${first_name || ""} ${last_name || ""}`.trim() || null

    if (!email) {
      return new Response("Error: No email address", { status: 400 })
    }

    // Upsert user in database
    await sql`
      INSERT INTO "User" (id, "clerkId", email, name, "profileImage", "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${id},
        ${email},
        ${name},
        ${image_url},
        NOW(),
        NOW()
      )
      ON CONFLICT ("clerkId") 
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        "profileImage" = EXCLUDED."profileImage",
        "updatedAt" = NOW()
    `
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data

    if (id) {
      await sql`DELETE FROM "User" WHERE "clerkId" = ${id}`
    }
  }

  return new Response("Webhook processed", { status: 200 })
}

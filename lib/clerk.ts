import { auth, currentUser } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

export { auth, currentUser }

export async function requireAuth() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return userId
}

export async function getCurrentUser() {
  const user = await currentUser()

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
    profileImage: user.imageUrl || null,
  }
}

/**
 * Ensures the user exists in the database, creating them if they don't.
 * This is a fallback in case the webhook hasn't fired yet.
 */
export async function ensureUserInDatabase(clerkUserId: string) {
  // Get user info from Clerk first
  const clerkUser = await currentUser()
  if (!clerkUser) {
    throw new Error("Unable to fetch user from Clerk")
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress || ""
  const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null
  const profileImage = clerkUser.imageUrl || null

  // Check if user already exists by clerkId OR email (handles race conditions)
  const existing = await sql`
    SELECT * FROM "User" 
    WHERE "clerkId" = ${clerkUserId} OR email = ${email} 
    LIMIT 1
  `
  
  if (existing[0]) {
    return existing[0]
  }

  // Try to insert - use ON CONFLICT DO NOTHING to handle race conditions gracefully
  await sql`
    INSERT INTO "User" (id, "clerkId", email, name, "profileImage", "createdAt", "updatedAt")
    VALUES (
      ${clerkUserId},
      ${clerkUserId},
      ${email},
      ${name},
      ${profileImage},
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING
  `

  // Fetch and return the user (either just created or created by concurrent request)
  const user = await sql`
    SELECT * FROM "User" 
    WHERE "clerkId" = ${clerkUserId} OR email = ${email} 
    LIMIT 1
  `
  return user[0]
}

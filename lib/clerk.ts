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
  // Check if user already exists
  const existing = await sql`SELECT * FROM "User" WHERE "clerkId" = ${clerkUserId} LIMIT 1`
  if (existing[0]) {
    return existing[0]
  }

  // Get user info from Clerk
  const clerkUser = await currentUser()
  if (!clerkUser) {
    throw new Error("Unable to fetch user from Clerk")
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress || ""
  const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null
  const profileImage = clerkUser.imageUrl || null

  // Try to insert, catch errors and return existing user if found
  try {
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
      ON CONFLICT ("clerkId") 
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        "profileImage" = EXCLUDED."profileImage",
        "updatedAt" = NOW()
    `
  } catch (error: any) {
    // If insert fails, try to find existing user by email or clerkId
    const byEmail = await sql`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`
    if (byEmail[0]) {
      return byEmail[0]
    }
    const byClerkId = await sql`SELECT * FROM "User" WHERE "clerkId" = ${clerkUserId} LIMIT 1`
    if (byClerkId[0]) {
      return byClerkId[0]
    }
    throw error
  }

  // Return the created user
  const user = await sql`SELECT * FROM "User" WHERE "clerkId" = ${clerkUserId} LIMIT 1`
  return user[0]
}

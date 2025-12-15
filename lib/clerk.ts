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
  // Check if user exists
  const existingUsers = await sql`SELECT * FROM "User" WHERE "clerkId" = ${clerkUserId}`
  
  if (existingUsers.length > 0) {
    return existingUsers[0]
  }

  // User doesn't exist, get info from Clerk and create them
  const clerkUser = await currentUser()
  
  if (!clerkUser || clerkUser.id !== clerkUserId) {
    throw new Error("Unable to fetch user from Clerk")
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (!email) {
    throw new Error("User has no email address")
  }

  const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null

  // Create user in database
  await sql`
    INSERT INTO "User" (id, "clerkId", email, name, "profileImage", "createdAt", "updatedAt")
    VALUES (
      ${clerkUserId},
      ${clerkUserId},
      ${email},
      ${name},
      ${clerkUser.imageUrl || null},
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

  // Return the created/updated user
  const users = await sql`SELECT * FROM "User" WHERE "clerkId" = ${clerkUserId}`
  return users[0]
}

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
  try {
    // Check if user exists by clerkId
    const existingUsers = await sql`SELECT * FROM "User" WHERE "clerkId" = ${clerkUserId}`
    
    if (existingUsers.length > 0) {
      return existingUsers[0]
    }

    // User doesn't exist, get info from Clerk and create them
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      throw new Error("Unable to fetch user from Clerk - currentUser returned null")
    }

    if (clerkUser.id !== clerkUserId) {
      throw new Error(`User ID mismatch: expected ${clerkUserId}, got ${clerkUser.id}`)
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress
    if (!email) {
      throw new Error("User has no email address")
    }

    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null

    // Check if user exists by email (in case of email conflict)
    const existingByEmail = await sql`SELECT * FROM "User" WHERE email = ${email}`
    
    if (existingByEmail.length > 0) {
      // User exists with same email but different clerkId - update the clerkId
      await sql`
        UPDATE "User"
        SET 
          "clerkId" = ${clerkUserId},
          name = ${name},
          "profileImage" = ${clerkUser.imageUrl || null},
          "updatedAt" = NOW()
        WHERE email = ${email}
      `
      
      const updatedUsers = await sql`SELECT * FROM "User" WHERE "clerkId" = ${clerkUserId}`
      if (updatedUsers[0]) {
        return updatedUsers[0]
      }
    }

    // Create user in database - use Clerk ID for both id and clerkId (matching webhook behavior)
    try {
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
    } catch (insertError: any) {
      // Handle race condition: if email conflict occurs, try to find and return existing user
      if (insertError?.code === '23505' && insertError?.constraint === 'User_email_key') {
        const usersByEmail = await sql`SELECT * FROM "User" WHERE email = ${email}`
        if (usersByEmail[0]) {
          // Update the existing user's clerkId if it doesn't match
          if (usersByEmail[0].clerkId !== clerkUserId) {
            await sql`
              UPDATE "User"
              SET 
                "clerkId" = ${clerkUserId},
                name = ${name},
                "profileImage" = ${clerkUser.imageUrl || null},
                "updatedAt" = NOW()
              WHERE email = ${email}
            `
            const updatedUsers = await sql`SELECT * FROM "User" WHERE "clerkId" = ${clerkUserId}`
            if (updatedUsers[0]) {
              return updatedUsers[0]
            }
          }
          return usersByEmail[0]
        }
      }
      // Re-throw if it's not an email conflict error
      throw insertError
    }

    // Return the created/updated user
    const users = await sql`SELECT * FROM "User" WHERE "clerkId" = ${clerkUserId}`
    
    if (!users[0]) {
      throw new Error("Failed to retrieve created user from database")
    }
    
    return users[0]
  } catch (error) {
    console.error("Error in ensureUserInDatabase:", error)
    throw error
  }
}

import { db } from "../index.js";
import { NewUser, users, refresh_token } from "../schema.js";
import { eq } from "drizzle-orm"

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getUser(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email))
    return result[0];
}

export async function getUserFromRefreshToken (token: string) {
    const rows = await db.select().from(refresh_token).where(eq(refresh_token.token, token))
    console.log(rows)
    if (rows.length === 0) {
      return null;
    }
    console.log(rows[0])
    return rows[0]
}
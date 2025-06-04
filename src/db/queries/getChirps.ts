import { db } from "../index.js";
import { eq, and } from "drizzle-orm"
import { NewChirp, chirps } from "../schema.js";

export async function getAllChirps() {
    return await db.select().from(chirps).orderBy(chirps.createdAt);
}

export async function getOneChirp(id: string) {
    return await db.select().from(chirps).where(eq(chirps.id, id))
}

export async function deleteChirp(id: string, userID: string) {
    const result = await db.delete(chirps).where(and(eq(chirps.id, id), eq(chirps.user_id, userID)));
    console.log(result)
    return result
}
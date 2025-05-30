import { db } from "../index.js";
import { eq } from "drizzle-orm"
import { NewChirp, chirps } from "../schema.js";

export async function getAllChirps() {
    return await db.select().from(chirps).orderBy(chirps.createdAt);
}

export async function getOneChirp(id: string) {
    return await db.select().from(chirps).where(eq(chirps.id, id))
}
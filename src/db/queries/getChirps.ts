import { db } from "../index.js";
import { eq, and } from "drizzle-orm"
import { NewChirp, chirps } from "../schema.js";
import { date } from "drizzle-orm/mysql-core/index.js";

export async function getAllChirps(authorId: string, sort: string) {
    let result
    if (!authorId) {
        result = (await db.select().from(chirps));
    } else {
        result = await db.select().from(chirps).where(eq(chirps.user_id, authorId))
    }
    return result.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);

        if (sort === "desc") {
            return dateB.getTime() - dateA.getTime();
        } else {
            return dateA.getTime() - dateB.getTime()
        }
    })
}

export async function getOneChirp(id: string) {
    return await db.select().from(chirps).where(eq(chirps.id, id))
}

export async function deleteChirp(id: string, userID: string) {
    const result = await db.delete(chirps).where(and(eq(chirps.id, id), eq(chirps.user_id, userID)));
    console.log('Database delete result:', result);
    return result
}
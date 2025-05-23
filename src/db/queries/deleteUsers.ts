import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function deleteAllUsers() {
    await db.delete(users);
}
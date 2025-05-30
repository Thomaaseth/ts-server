import { db } from "../index.js";
import { NewUser, users, refresh_token } from "../schema.js";

export async function deleteAllUsers() {
    await db.delete(refresh_token);
    await db.delete(users);
}
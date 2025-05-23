import type { Request, Response } from "express";
import { config } from "../config.js";
import { deleteAllUsers } from "../db/queries/deleteUsers.js";
import { respondWithError, respondWithJSON } from "./handlerJson.js";


export async function handlerReset(req: Request, res: Response) {
        if (config.platform != "dev") {
            respondWithError(res, 403, "Forbidden")
            return
        }
        await deleteAllUsers()
        respondWithJSON(res, 200, { message: "success" })
}
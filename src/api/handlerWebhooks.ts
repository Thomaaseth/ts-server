
import type { Request, Response } from "express";
import { upgradeUserToRed } from "../db/queries/createUser.js"
import { BadRequestError, NotFoundError, UserNotAuthenticatedError } from "./errors.js";
import { getAPIKey } from "../auth/auth.js";
import { config } from "../config.js";

export async function handlerWebhooks(req: Request, res: Response) {
    const apiKeyAuthorized = getAPIKey(req)

    if (apiKeyAuthorized !== config.polkaKey) {
        throw new UserNotAuthenticatedError("API key not authorized")
    }

    type parameters = {
        event: string,
        data: {
            userId: string,
        }
    }


    const params: parameters = req.body;

    if (params.event !== "user.upgraded") {
        res.status(204).send()
        return
    }

    const upgradeUser = await upgradeUserToRed(params.data.userId)

    if (!upgradeUser || upgradeUser.length === 0) {
        res.status(404).send()
        return
    }
    res.status(204).send()
}
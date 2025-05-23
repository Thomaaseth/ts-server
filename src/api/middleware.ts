import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { respondWithError } from "./handlerJson.js";
import { BadRequestError, NotFoundError, UserForbiddenError, UserNotAuthenticatedError } from "./errors.js";




export async function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const statusCode = res.statusCode
        if (statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`)
        }
    })
    next();
}

export async function middlewareMetrics(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits += 1;
    next()
}

export async function middlewareErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    let statusCode = 500;
    let message = "Something went wrong on our end"

    if (err instanceof BadRequestError) {
        statusCode = 400;
        message = err.message;
    } else if (err instanceof UserNotAuthenticatedError) {
        statusCode = 401;
        message = err.message;
    } else if (err instanceof UserForbiddenError) {
        statusCode = 403;
        message = err.message;
    } else if (err instanceof NotFoundError) {
        statusCode = 404;
        message = err.message;
    }
    if (statusCode >= 500) {
        console.log(err.message);
    }

    respondWithError(res, statusCode, message);

}
import type { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./handlerJson.js"
import { createUser } from "../db/queries/createUser.js"
import { config } from "../config.js";

export async function handlerCreateUser(req: Request, res: Response) {
    
      const email = req.body.email;

      if (!email || email.length === 0) {
        throw new BadRequestError(
          `Email is empty`,
        )
      }
    try {
        const newUser = await createUser({ email })

        respondWithJSON(res, 201, {
            id: newUser.id,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
            email: newUser.email,
      });
    } catch (err) {
        throw new BadRequestError(
            `Error creating user`
        )
    }
}
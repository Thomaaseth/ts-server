import type { Request, Response } from "express";
import { respondWithJSON } from "./handlerJson.js"
import { BadRequestError } from "./errors.js";
import { createChirp } from "../db/queries/createChirp.js";

export async function handlerCreateChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
        userId: string;
      };

      const params: parameters = req.body;

      const maxChirpLength = 140;
      if (params.body.length > maxChirpLength) {
        throw new BadRequestError(
          `Chirp is too long. Max length is ${maxChirpLength}`,
        )
      }

      const profaneWords = ["kerfuffle", "sharbert", "fornax"]
      const words = params.body.split(" ")

      const cleanedWords = words.map(word => {
        if (profaneWords.includes(word.toLocaleLowerCase())) {
            return "****";
        }
        return word;
      })

      const cleanedBody = cleanedWords.join(" ")
      const NewChirp = await createChirp({ body: cleanedBody, user_id: params.userId})

      respondWithJSON(res, 201, {
        id: NewChirp.id,
        createdAt: NewChirp.createdAt,
        updatedAt: NewChirp.updatedAt,
        body: NewChirp.body,
        userId: NewChirp.user_id,
      });
}
    
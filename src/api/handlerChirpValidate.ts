import type { Request, Response } from "express";
import { respondWithJSON } from "./handlerJson.js"
import { BadRequestError } from "./errors.js";

export async function handlerChirpValidate(req: Request, res: Response) {
    type parameters = {
        body: string;
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

      respondWithJSON(res, 200, {
        cleanedBody: cleanedBody,
      });
}
    
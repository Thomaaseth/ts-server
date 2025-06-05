import type { Request, Response } from "express";
import { respondWithJSON } from "./handlerJson.js"
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors.js";
import { createChirp } from "../db/queries/createChirp.js";
import { getAllChirps, getOneChirp, deleteChirp } from "../db/queries/getChirps.js";
import { getBearerToken, validateJWT } from "../auth/auth.js";
import { config } from "../config.js";

export async function handlerCreateChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
      };

      const params: parameters = req.body;

      const token = getBearerToken(req);
      const userId = validateJWT(token, config.secret);

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
      const NewChirp = await createChirp({ body: cleanedBody, user_id: userId})

      respondWithJSON(res, 201, {
        id: NewChirp.id,
        createdAt: NewChirp.createdAt,
        updatedAt: NewChirp.updatedAt,
        body: NewChirp.body,
        userId: NewChirp.user_id,
      });
}

export async function handlerGetAllChirps(req: Request, res: Response) {
    try {
        const result = await getAllChirps()
        respondWithJSON(res, 200, result)
    } catch (err) {
        throw new BadRequestError(`Error fetching all Chirps`)
    }
}
  
export async function handlerGetOneChirp(req: Request, res: Response) {
    const chirpID = req.params.chirpID
    const result = await getOneChirp(chirpID);

    if (result.length != 0) {
        respondWithJSON(res, 200, result[0]);
    } else {
        throw new NotFoundError(`Not found`);
    }
}

export async function handlerDeleteChirp(req: Request, res: Response) {
  const chirpID = req.params.chirpID;
  const accessToken = getBearerToken(req);
  const userId = validateJWT(accessToken, config.secret)

  const chirpToDelete = await getOneChirp(chirpID)

  if (!chirpToDelete || chirpToDelete.length === 0) {
    throw new NotFoundError(`Chirp not found`)
  }

  const chirp = chirpToDelete[0];

  if (chirp.user_id !== userId) {
    throw new UserForbiddenError('You can only delete your own chirps');

  }
    const deletedChirp = await deleteChirp(chirpID, userId);
    console.log('Delete result:', deletedChirp);

    res.status(204).send();
    
  }

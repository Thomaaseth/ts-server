import type { Request, Response } from "express";
import { BadRequestError, NotFoundError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./handlerJson.js"
import { createUser, getUser, getUserFromRefreshToken } from "../db/queries/createUser.js"
import { hashPassword, checkPasswordHash, makeJWT, makeRefreshToken, getBearerToken } from "../auth/auth.js";
import { config } from "../config.js";
import { refresh_token } from "../db/schema.js";
import { db } from "../db/index.js"
import { eq } from "drizzle-orm";

export async function handlerCreateUser(req: Request, res: Response) {
    
      const email = req.body.email;
      const password = req.body.password

      if (!email || email.length === 0) {
        throw new BadRequestError(
          `Email is empty`,
        )
      }

      if (!password || password.length === 0) {
        throw new BadRequestError(
          `Password is empty`
        )
      }

    try {
        const hashedPassword  = await hashPassword(password)

        const newUser = await createUser({ email, hashed_password: hashedPassword })

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

export async function handlerLogin(req: Request, res: Response) {
  const email = req.body.email;
  const password = req.body.password
  const tokenEpiry = 60 * 60


  const user = await getUser(email)

  if (!user) {
    respondWithError(res, 401, "Incorrect email or password")
    return
  }

  const passwordChecked = await checkPasswordHash(password, user.hashed_password) 

  if (!passwordChecked) {
    respondWithError(res, 401, "Incorrect email or password")
    return
  }

  const accessToken = makeJWT(user.id, tokenEpiry, config.secret);
  const refreshToken = makeRefreshToken();
  const now = new Date()
  const nowInMilliseconds = now.getTime()
  const daysInMilliseconds =  1000 * 60 * 60 * 24 * 60
  const expiryDate = nowInMilliseconds + daysInMilliseconds

  const refreshTokenDB = {
    token: refreshToken,
    createdAt: now,
    updatedAt: now,
    user_id: user.id,
    expiresAt: new Date(expiryDate),
    revokedAt: null
  }

  await db.insert(refresh_token).values(refreshTokenDB);
  console.log("Successfully inserted refresh token into database:", refreshTokenDB);


  return respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: accessToken,
    refreshToken: refreshToken,
  })
}

export async function handlerRefresh(req: Request, res: Response) {
  const refreshToken = getBearerToken(req)
  console.log("Extracted refresh token:", refreshToken);

  const now = new Date()
  const tokenEpiry = 60 * 60


  const tokens = await db.select().from(refresh_token).where(eq(refresh_token.token, refreshToken))
  console.log("Database query result for token:", tokens);

  const tokenRow = tokens[0]

  if (!tokenRow) {
    console.log("No token row found for token:", refreshToken);

    throw new UserNotAuthenticatedError(`Not authorized`)
  } 
  else if (tokenRow.revokedAt != null) {
    console.log("Token is revoked. revokedAt:", tokenRow.revokedAt);

    throw new UserNotAuthenticatedError(`Not authorized`) 
  }
  else if (tokenRow.expiresAt == null) {
    console.log("Token has no expiresAt. expiresAt:", tokenRow.expiresAt);

    throw new UserNotAuthenticatedError("Not authorized");
  }
  else if (now > tokenRow.expiresAt) {
    console.log("Token is expired. now:", now, "expiresAt:", tokenRow.expiresAt);

    throw new UserNotAuthenticatedError(`Not authorized`)
  } else {
    console.log("Token is valid. Attempting to get user from refresh token:", tokenRow.token);

    const userToken = await getUserFromRefreshToken(tokenRow.token)
    console.log("Result of getUserFromRefreshToken:", userToken);

    if (!userToken) {
      console.log("getUserFromRefreshToken returned null.");

      throw new UserNotAuthenticatedError(`You need to provide valid credentials (or a valid refresh token)`)
    }
    if (userToken.user_id == null) {
      throw new UserNotAuthenticatedError(`You need to provide valid credentials (or a valid refresh token)`)

    }
    console.log("Calling makeJWT with userToken:", userToken, "tokenExpiry:", tokenEpiry, "secret:", config.secret);

    const newToken = makeJWT(userToken.user_id, tokenEpiry, config.secret)
    console.log("Newly generated access token:", newToken);
    console.log("Responding with status 200 and token:", newToken);

    respondWithJSON(res, 200, {
      token: newToken
    })
  }
}


export async function handlerRevoke(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  const tokens = await db.select().from(refresh_token).where(eq(refresh_token.token, refreshToken))
  const tokenRow = tokens[0]
  const now = new Date()

  const revokeToken = {
    revokedAt: now,
    updatedAt: now,
  }

    await db.update(refresh_token).set(revokeToken).where(eq(refresh_token.token, refreshToken));
    
    return respondWithJSON(res, 204, "")
}

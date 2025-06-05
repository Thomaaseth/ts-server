import bcrypt from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UserNotAuthenticatedError } from "../api/errors.js"
import { Request, Response } from "express"
import crypto from "crypto";

const saltRounds = 10;

const TOKEN_ISSUER = "chirpy"

export async function hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    return hashedPassword
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expriresAt = issuedAt + expiresIn;
    
    const payload = {
        iss: TOKEN_ISSUER,
        sub: userID, 
        iat: issuedAt,
        exp: expriresAt,
    }

    var token = jwt.sign(payload, secret)

    return token
}

export function validateJWT(tokenString: string, secret: string): string {
    let decoded: payload;
    try {
      decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (e) {
      throw new UserNotAuthenticatedError("Invalid token");
    }
  
    if (decoded.iss !== TOKEN_ISSUER) {
      throw new UserNotAuthenticatedError("Invalid issuer");
    }
  
    if (!decoded.sub) {
      throw new UserNotAuthenticatedError("No user ID in token");
    }
  
    return decoded.sub;
  }

// export function getBearerToken(req: Request): string {
//     const token = req.get("Authorization")
//     if (!token) {
//         throw new UserNotAuthenticatedError("Invalid token")
//     }
//     if (!token.toLowerCase().startsWith("bearer ")) {
//         throw new UserNotAuthenticatedError("Invalid token")
//     }
//     return token.slice(7).replace("Bearer ", "").trim()
// }

export function getBearerToken(req: Request) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }

  return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new BadRequestError("Malformed authorization header");
  }
  return splitAuth[1];
}


export function makeRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function getAPIKey(req: Request) {
  const apiHeader = req.get("Authorization");
  if (!apiHeader) {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }
  return extractAPIKey(apiHeader);
}

export function extractAPIKey(header: string) {
  const splitAPIKey = header.split(" ");
  if (splitAPIKey.length < 2 || splitAPIKey[0] !== "ApiKey") {
    throw new BadRequestError("Malformed authorization header")
  }
  return splitAPIKey[1];
}
import type { Request, Response } from "express";

export function handlerChirpLength(req: Request, res: Response) {
    let body = "";

    req.on("data", (chirp) => {
        body += chirp;
    })

    req.on("end", () => {
        try {
            const parsedBody = JSON.parse(body)
            if (typeof parsedBody.body === "string" && parsedBody.body.length > 140) {
                res.status(400).json({ error: "Chirp is too long" })
                return
            }
        } catch (error) {
            res.status(400).json({ error: "Something went wrong" })
            return
        }
        res.status(200).json({ valid: true})
    })
}
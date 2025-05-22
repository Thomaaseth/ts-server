import type { Request, Response } from "express";
import { config } from "../config.js";


export async function handlerInc(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<html>
        <body>
            <h1>Welcome, Chirpy Admin</h1>
            <p>Chirpy has been visited ${config.fileserverHits} times!</p>
        </body>
        </html>`);
}

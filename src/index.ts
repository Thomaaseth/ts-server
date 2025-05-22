import express from "express";
import { middlewareLogResponses, middlewareMetrics } from "./api/middleware.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerInc } from "./api/handlerInc.js";
import { handlerReset } from "./api/handlerReset.js";
import { handlerChirpLength } from "./api/handlerChirpLength.js"

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses)
app.use("/app", middlewareMetrics, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerChirpLength);
app.get("/admin/metrics", handlerInc);
app.post("/admin/reset", handlerReset);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});


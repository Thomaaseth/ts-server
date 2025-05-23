import express from "express";
import { middlewareLogResponses, middlewareMetrics, middlewareErrorHandler } from "./api/middleware.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerInc } from "./api/handlerInc.js";
import { handlerReset } from "./api/handlerReset.js";
import { handlerChirpValidate } from "./api/handlerChirpValidate.js"

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses)
app.use(express.json())
app.use("/app", middlewareMetrics, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
  });
app.post("/api/validate_chirp", (req, res, next) => {
    Promise.resolve(handlerChirpValidate(req, res)).catch(next);
  });
app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerInc(req, res)).catch(next);
  });
  app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res)).catch(next);
  });


app.use(middlewareErrorHandler)

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});


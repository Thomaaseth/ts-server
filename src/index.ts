import express from "express";
import postgres from "postgres";
import { middlewareLogResponses, middlewareMetrics, middlewareErrorHandler } from "./api/middleware.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerInc } from "./api/handlerInc.js";
import { handlerReset } from "./api/handlerReset.js";
import { handlerCreateUser, handlerLogin, handlerRefresh, handlerRevoke, handlerUserProfile } from "./api/handlerUser.js"
import { handlerCreateChirp, handlerGetAllChirps, handlerGetOneChirp, handlerDeleteChirp } from "./api/handlerChirps.js"
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import { handlerWebhooks } from "./api/handlerWebhooks.js"
const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetrics, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
  });
app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerInc(req, res)).catch(next);
  });
  app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res)).catch(next);
  });
app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerCreateUser(req, res)).catch(next);
})
app.put("/api/users", (req, res, next) => {
  Promise.resolve(handlerUserProfile(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerLogin(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
  Promise.resolve(handlerRefresh(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
  Promise.resolve(handlerRevoke(req, res)).catch(next);
});
app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerCreateChirp(req, res).catch(next));
});
app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerGetAllChirps(req, res).catch(next))
});
app.get("/api/chirps/:chirpID", (req, res, next) => {
  Promise.resolve(handlerGetOneChirp(req, res).catch(next))
});
app.delete("/api/chirps/:chirpID", (req, res, next) => {
  Promise.resolve(handlerDeleteChirp(req, res).catch(next))
});
app.post("/api/polka/webhooks", (req, res, next) => {
  Promise.resolve(handlerWebhooks(req, res).catch(next))
});

app.use(middlewareErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});


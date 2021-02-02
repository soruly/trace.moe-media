import "dotenv/config.js";
import express from "express";
import video from "./src/video.js";
import image from "./src/image.js";
import rateLimit from "express-rate-limit";

const { SERVER_PORT, SERVER_ADDR } = process.env;

const app = express();

app.set("trust proxy", 1);
app.use(
  rateLimit({
    max: 30, // 30 requests per IP address (per node.js process)
    windowMs: 60 * 1000, // per 1 minute
  })
);

app.get("/video/:anilistID/:filename", video);

app.get("/image/:anilistID/:filename", image);

app.listen(SERVER_PORT, SERVER_ADDR, () =>
  console.log(`Media server listening on port ${SERVER_PORT}`)
);

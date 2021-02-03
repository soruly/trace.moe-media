import "dotenv/config.js";
import express from "express";
import rateLimit from "express-rate-limit";
import getVideo from "./src/get-video.js";
import putVideo from "./src/put-video.js";
import deleteVideo from "./src/delete-video.js";
import video from "./src/video.js";
import image from "./src/image.js";

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

app.get("/:anilistID/:filename", getVideo);

app.put("/:anilistID/:filename", putVideo);

app.delete("/:anilistID/:filename", deleteVideo);

app.listen(SERVER_PORT, SERVER_ADDR, () =>
  console.log(`Media server listening on port ${SERVER_PORT}`)
);

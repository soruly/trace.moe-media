import "dotenv/config.js";
import express from "express";
import rateLimit from "express-rate-limit";
import getVideo from "./src/get-video.js";
import listVideo from "./src/list-video.js";
import list from "./src/list.js";
import putVideo from "./src/put-video.js";
import deleteVideo from "./src/delete-video.js";
import video from "./src/video.js";
import image from "./src/image.js";
import checkSecret from "./src/check-secret.js";

const { SERVER_PORT, SERVER_ADDR } = process.env;

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(
  rateLimit({
    max: 30, // 30 requests per IP address (per node.js process)
    windowMs: 60 * 1000, // per 1 minute
  })
);

app.get("/health", (req, res) => res.send("ok"));

app.get("/video/:anilistID/:filename", video);

app.get("/image/:anilistID/:filename", image);

app.get("/:anilistID/:filename", checkSecret, getVideo);

app.put("/:anilistID/:filename", checkSecret, putVideo);

app.delete("/:anilistID/:filename", checkSecret, deleteVideo);

app.get("/:anilistID/", checkSecret, listVideo);

app.get("/", checkSecret, list);

app.listen(SERVER_PORT, SERVER_ADDR, () =>
  console.log(`Media server listening on port ${SERVER_PORT}`)
);

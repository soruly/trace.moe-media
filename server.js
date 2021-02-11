import "dotenv/config.js";
import express from "express";
import rateLimit from "express-rate-limit";
import getVideo from "./src/get-video.js";
import list from "./src/list.js";
import putVideo from "./src/put-video.js";
import deleteVideo from "./src/delete-video.js";
import video from "./src/video.js";
import image from "./src/image.js";
import checkSecret from "./src/check-secret.js";

const { SERVER_PORT, SERVER_ADDR } = process.env;

const app = express();

app.disable("x-powered-by");

app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Referrer-Policy", "no-referrer");
  res.set("X-Content-Type-Options", "nosniff");
  res.set(
    "Content-Security-Policy",
    [
      "default-src 'none'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
      "form-action 'none'",
      "block-all-mixed-content",
    ].join("; ")
  );
  next();
});

app.use(
  rateLimit({
    max: 30, // 30 requests per IP address (per node.js process)
    windowMs: 60 * 1000, // per 1 minute
  })
);

app.get("/", (req, res) => res.send("ok"));

app.use("/list", checkSecret, list);

app.get("/video/:anilistID/:filename", video);

app.get("/image/:anilistID/:filename", image);

app.get("/:anilistID/:filename", checkSecret, getVideo);

app.put("/:anilistID/:filename", checkSecret, putVideo);

app.delete("/:anilistID/:filename", checkSecret, deleteVideo);

app.listen(SERVER_PORT, SERVER_ADDR, () =>
  console.log(`Media server listening on port ${SERVER_PORT}`)
);

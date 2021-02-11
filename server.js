import "dotenv/config.js";
import express from "express";
import rateLimit from "express-rate-limit";
import list from "./src/list.js";
import video from "./src/video.js";
import image from "./src/image.js";
import file from "./src/file.js";
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
      "media-src 'self'",
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

app.get("/video/:anilistID/:filename", video);

app.get("/image/:anilistID/:filename", image);

app.use("/file/:anilistID/:filename", checkSecret, file);

app.use("/list", checkSecret, list);

app.listen(SERVER_PORT, SERVER_ADDR, () =>
  console.log(`Media server listening on ${SERVER_ADDR}:${SERVER_PORT}`)
);

import "dotenv/config.js";
import { performance } from "perf_hooks";
import express from "express";
import rateLimit from "express-rate-limit";
import list from "./src/list.js";
import admin from "./src/admin.js";
import video from "./src/video.js";
import image from "./src/image.js";
import file from "./src/file.js";
import checkSecret from "./src/check-secret.js";
import checkIP from "./src/check-ip.js";

const {
  SERVER_ADDR = "0.0.0.0",
  SERVER_PORT = 3000,
  VIDEO_PATH = "/mnt/",
  TRACE_MEDIA_SALT,
  TRACE_API_SECRET,
} = process.env;

const app = express();

app.disable("x-powered-by");

app.set("trust proxy", 1);

app.use((req, res, next) => {
  const startTime = performance.now();
  console.log("=>", new Date().toISOString(), req.ip, req.path);
  res.on("finish", () => {
    console.log(
      "<=",
      new Date().toISOString(),
      req.ip,
      req.path,
      res.statusCode,
      `${(performance.now() - startTime).toFixed(0)}ms`
    );
  });
  next();
});

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

app.use("/admin", checkIP, admin);

app.use("/admin", checkIP, express.static(VIDEO_PATH));

if (TRACE_API_SECRET) {
  console.log("Video upload/download secured by TRACE_API_SECRET");
}
if (TRACE_MEDIA_SALT) {
  console.log("Video clip and image secured by TRACE_MEDIA_SALT");
}

console.log(`VIDEO_PATH: ${VIDEO_PATH}`);
app.listen(SERVER_PORT, SERVER_ADDR, () =>
  console.log(`Media server listening on ${SERVER_ADDR}:${SERVER_PORT}`)
);

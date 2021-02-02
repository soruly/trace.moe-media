import "dotenv/config.js";
import express from "express";
import video from "./src/video.js";
import image from "./src/image.js";

const { SERVER_PORT, SERVER_ADDR } = process.env;

const app = express();

app.get("/video/:anilistID/:filename", video);

app.get("/image/:anilistID/:filename", image);

app.listen(SERVER_PORT, SERVER_ADDR, () =>
  console.log(`Media server listening on port ${SERVER_PORT}`)
);

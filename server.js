import "dotenv/config.js";
import path from "path";
import fs from "fs-extra";
import express from "express";
import detectScene from "./src/detect-scene.js";
import generateVideoPreview from "./src/generate-video-preview.js";
import generateImagePreview from "./src/generate-image-preview.js";

const { VIDEO_PATH, SERVER_PORT, SERVER_ADDR } = process.env;

const app = express();
// route for internal testing
app.get("/", (req, res) => {
  const html = `
  anilistID <input id="anilistID" type="number"><br>
  filename <input id="filename" type="text"><br>
  t <input id="t" type="number" step="1" min="0"><br>
  <video controls autoplay mute loop width="640" height="360"></video>
  <script>
    document.querySelector("#t").addEventListener("change", function(){
      document.querySelector("video").src = "/video/" + document.querySelector("#anilistID").value + "/" + document.querySelector("#filename").value + "?t=" + document.querySelector("#t").value;
    });
  </script>
  `;
  res.send(html);
});

app.get("/video/:anilistID/:filename", async (req, res) => {
  const t = parseFloat(req.query.t);
  if (isNaN(t) || t < 0) {
    res.status(400).send("Bad Request. Invalid param: t");
    return;
  }
  const videoFilePath = path.join(VIDEO_PATH, req.params.anilistID, req.params.filename);
  if (!videoFilePath.startsWith(VIDEO_PATH)) {
    res.status(403).send("403 Forbidden");
    return;
  }
  if (!fs.existsSync(videoFilePath)) {
    res.status(404).send("Not found");
    return;
  }
  const size = req.query.size || "m";
  if (!["l", "m", "s"].includes(size)) {
    res.status(400).send("Bad Request. Invalid param: size");
    return;
  }
  try {
    const scene = await detectScene(videoFilePath, t);
    if (scene === null) {
      res.status(500).send("Internal Server Error");
      return;
    }
    const video = generateVideoPreview(
      videoFilePath,
      scene.start,
      scene.end,
      size,
      "mute" in req.query
    );
    res.set("Content-Type", "video/mp4");
    res.set("X-Trace-Start", scene.start);
    res.set("X-Trace-End", scene.end);
    res.set("X-Trace-Duration", scene.duration);
    res.send(video);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/image/:anilistID/:filename", async (req, res) => {
  const t = parseFloat(req.query.t);
  if (isNaN(t) || t < 0) {
    res.status(400).send("Bad Request. Invalid param: t");
    return;
  }
  const videoFilePath = path.join(VIDEO_PATH, req.params.anilistID, req.params.filename);
  if (!videoFilePath.startsWith(VIDEO_PATH)) {
    res.status(403).send("403 Forbidden");
    return;
  }
  if (!fs.existsSync(videoFilePath)) {
    res.status(404).send("Not found");
    return;
  }
  const size = req.query.size || "m";
  if (!["l", "m", "s"].includes(size)) {
    res.status(400).send("Bad Request. Invalid param: size");
    return;
  }
  try {
    const image = generateImagePreview(videoFilePath, t, size);
    res.set("Content-Type", "image/jpg");
    res.send(image);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(SERVER_PORT, SERVER_ADDR, () =>
  console.log(`Media server listening on port ${SERVER_PORT}`)
);

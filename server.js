require("dotenv").config();
const path = require("path");
const fs = require("fs-extra");
const express = require("express");
const {detectScene} = require("./src/detect-scene.js");
const {generateVideoPreview} = require("./src/generate-video-preview.js");

const {VIDEO_PATH, SERVER_PORT} = process.env;

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
    res.status(400).send("Bad Request");
    return;
  }
  const videoFilePath = path.join(VIDEO_PATH, req.params.anilistID, req.params.filename);
  if (!fs.existsSync(videoFilePath)) {
    res.status(404).send("Not found");
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
      {mute: "mute" in req.query}
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

app.listen(SERVER_PORT, () => console.log(`Media server listening on port ${SERVER_PORT}`));

import "dotenv/config.js";
import crypto from "crypto";
import express from "express";
import video from "./src/video.js";
import image from "./src/image.js";

const { SERVER_PORT, SERVER_ADDR, TRACE_MEDIA_SALT } = process.env;

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

app.use(["/video/", "/image/"], async (req, res, next) => {
  if (
    req.query.token !==
    crypto
      .createHash("md5")
      .update(`${req.query.t}${TRACE_MEDIA_SALT}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
  ) {
    return res.sendStatus(403);
  }
  next();
});

app.get("/video/:anilistID/:filename", video);

app.get("/image/:anilistID/:filename", image);

app.listen(SERVER_PORT, SERVER_ADDR, () =>
  console.log(`Media server listening on port ${SERVER_PORT}`)
);

import path from "path";
import fs from "fs-extra";
import crypto from "crypto";
import child_process from "child_process";

const { VIDEO_PATH = "/mnt/", TRACE_MEDIA_SALT } = process.env;

const generateImagePreview = (filePath, t, size = "m") => {
  const ffmpeg = child_process.spawnSync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-nostats",
    "-y",
    "-ss",
    t - 10,
    "-i",
    filePath,
    "-ss",
    "10",
    "-vf",
    `scale=${{ l: 640, m: 320, s: 160 }[size]}:-2`,
    "-c:v",
    "mjpeg",
    "-vframes",
    "1",
    "-f",
    "image2pipe",
    "pipe:1",
  ]);
  if (ffmpeg.stderr.length) {
    console.log(ffmpeg.stderr.toString());
  }
  return ffmpeg.stdout;
};

export default async (req, res) => {
  if (
    TRACE_MEDIA_SALT &&
    req.query.token !==
      crypto
        .createHash("sha1")
        .update(
          [
            req.params.anilistID,
            req.params.filename,
            req.query.t,
            req.query.now,
            TRACE_MEDIA_SALT,
          ].join("")
        )
        .digest("base64")
        .replace(/[^0-9A-Za-z]/g, "")
  ) {
    return res.status(403).send("Forbidden");
  }
  if (((Date.now() / 1000) | 0) - Number(req.query.now) > 300) return res.status(410).send("Gone");
  const t = parseFloat(req.query.t);
  if (isNaN(t) || t < 0) {
    return res.status(400).send("Bad Request. Invalid param: t");
  }
  const videoFilePath = path.join(
    VIDEO_PATH,
    req.params.anilistID,
    req.params.filename.replace(/\.jpg$/, "")
  );
  if (!videoFilePath.startsWith(VIDEO_PATH)) {
    return res.status(403).send("Forbidden");
  }
  if (!fs.existsSync(videoFilePath)) {
    return res.status(404).send("Not found");
  }
  const size = req.query.size || "m";
  if (!["l", "m", "s"].includes(size)) {
    return res.status(400).send("Bad Request. Invalid param: size");
  }
  try {
    const image = generateImagePreview(videoFilePath, t, size);
    res.set("Content-Type", "image/jpg");
    res.send(image);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
};

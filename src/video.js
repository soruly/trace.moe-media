import path from "path";
import fs from "fs-extra";
import os from "os";
import crypto from "crypto";
import child_process from "child_process";

import detectScene from "./lib/detect-scene.js";

const { VIDEO_PATH, TRACE_MEDIA_SALT } = process.env;

const generateVideoPreview = (filePath, start, end, size = "m", mute = false) => {
  const tempPath = path.join(os.tmpdir(), `videoPreview${process.hrtime().join("")}.mp4`);
  const ffmpeg = child_process.spawnSync(
    "ffmpeg",
    [
      "-y",
      "-ss",
      start - 10,
      "-i",
      filePath,
      "-ss",
      "10",
      "-t",
      end - start,
      mute ? "-an" : "-y",
      "-vf",
      `scale=${{ l: 640, m: 320, s: 160 }[size]}:-2`,
      "-crf",
      "23",
      "-preset",
      "faster",
      "-max_muxing_queue_size",
      "1024",
      tempPath,
    ],
    { encoding: "utf-8" }
  );
  // console.log(ffmpeg.stderr);
  const videoBuffer = fs.readFileSync(tempPath);
  fs.removeSync(tempPath);
  return videoBuffer;
};

export default async (req, res) => {
  if (
    TRACE_MEDIA_SALT &&
    req.query.token !==
      crypto
        .createHash("sha1")
        .update([req.params.anilistID, req.params.filename, req.query.t, TRACE_MEDIA_SALT].join(""))
        .digest("base64")
        .replace(/[^0-9A-Za-z]/g, "")
  ) {
    return res.status(400).send("Bad Request");
  }
  const t = parseFloat(req.query.t);
  if (isNaN(t) || t < 0) {
    return res.status(400).send("Bad Request");
  }
  const videoFilePath = path.join(VIDEO_PATH, req.params.anilistID, req.params.filename);
  if (!videoFilePath.startsWith(VIDEO_PATH)) {
    return res.status(403).send("Forbidden");
  }
  if (!fs.existsSync(videoFilePath)) {
    return res.status(404).send("Not found");
  }
  const size = req.query.size || "m";
  if (!["l", "m", "s"].includes(size)) {
    return res.status(400).send("Bad Request");
  }
  const minDuration = Number(req.query.minDuration) || 0.25;
  try {
    const scene = await detectScene(videoFilePath, t, minDuration > 2 ? 2 : minDuration);
    if (scene === null) {
      return res.status(500).send("Internal Server Error");
    }
    const video = generateVideoPreview(
      videoFilePath,
      scene.start,
      scene.end,
      size,
      "mute" in req.query
    );
    res.set("Content-Type", "video/mp4");
    res.set("x-video-start", scene.start);
    res.set("x-video-end", scene.end);
    res.set("x-video-duration", scene.duration);
    res.set("Access-Control-Expose-Headers", "x-video-start, x-video-end, x-video-duration");
    res.send(video);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
};

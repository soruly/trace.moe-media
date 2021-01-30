import os from "os";
import path from "path";
import child_process from "child_process";
import fs from "fs-extra";

export default (filePath, start, end, size = "m", mute = false) => {
  const tempPath = path.join(os.tmpdir(), `videoPreview${process.hrtime().join("")}.mp4`);
  child_process.spawnSync(
    "ffmpeg",
    [
      "-y",
      "-ss",
      start,
      "-i",
      filePath,
      "-t",
      end - start,
      mute ? "-an" : "-y",
      "-vf",
      `scale=${{ l: 640, m: 320, s: 160 }[size]}:-2`,
      "-crf",
      "23",
      "-preset",
      "faster",
      tempPath,
    ],
    { encoding: "utf-8" }
  );
  const videoBuffer = fs.readFileSync(tempPath);
  fs.removeSync(tempPath);
  return videoBuffer;
};

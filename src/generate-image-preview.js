import child_process from "child_process";

export default (filePath, t, size = "m") => {
  const ffmpeg = child_process.spawnSync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-nostats",
    "-y",
    "-ss",
    t,
    "-i",
    filePath,
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

const child_process = require("child_process");

const getVideoDuration = (filePath) => {
  const stdLog = child_process.spawnSync(
    "ffprobe",
    ["-i", filePath, "-show_entries", "format=duration", "-v", "quiet"],
    { encoding: "utf-8" }
  ).stdout;
  const result = /duration=((\d|\.)+)/.exec(stdLog);
  if (result === null) {
    return null;
  }
  return parseFloat(result[1]);
};
module.exports = { getVideoDuration };

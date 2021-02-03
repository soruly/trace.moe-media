import path from "path";
import fs from "fs-extra";

const { VIDEO_PATH } = process.env;

export default async (req, res) => {
  const videoFilePath = path.join(VIDEO_PATH, req.params.anilistID, req.params.filename);
  if (!videoFilePath.startsWith(VIDEO_PATH)) {
    res.status(403).send("403 Forbidden");
    return;
  }
  if (!fs.existsSync(videoFilePath)) {
    res.status(404).send("Not found");
    return;
  }
  res.set("Content-Type", "video/mp4");
  res.send(fs.readFileSync(videoFilePath));
};

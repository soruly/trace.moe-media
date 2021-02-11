import path from "path";
import fs from "fs-extra";

const { VIDEO_PATH } = process.env;

export default async (req, res) => {
  const videoDirPath = path.join(VIDEO_PATH, req.path);
  if (!videoDirPath.startsWith(VIDEO_PATH)) {
    res.status(403).send("Forbidden");
    return;
  }
  if (!fs.existsSync(videoDirPath)) {
    res.status(404).send("Not found");
    return;
  }
  res.json(fs.readdirSync(videoDirPath));
};

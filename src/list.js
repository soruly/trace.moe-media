import path from "path";
import fs from "fs-extra";

const { VIDEO_PATH = "/mnt/" } = process.env;

export default async (req, res) => {
  const videoDirPath = path.join(VIDEO_PATH, req.path);
  if (!videoDirPath.startsWith(VIDEO_PATH)) {
    return res.status(403).send("Forbidden");
  }
  if (!fs.existsSync(videoDirPath)) {
    return res.status(404).send("Not found");
  }
  res.json(fs.readdirSync(videoDirPath));
};

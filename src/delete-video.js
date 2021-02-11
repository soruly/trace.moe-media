import path from "path";
import fs from "fs-extra";

const { VIDEO_PATH } = process.env;

export default async (req, res) => {
  const videoFilePath = path.join(VIDEO_PATH, req.params.anilistID, req.params.filename);
  if (!videoFilePath.startsWith(VIDEO_PATH)) {
    res.status(403).send("Forbidden");
    return;
  }
  console.log(`Deleting ${videoFilePath}`);
  fs.removeSync(videoFilePath);

  console.log(`Deleted ${videoFilePath}`);
  res.sendStatus(204);
};

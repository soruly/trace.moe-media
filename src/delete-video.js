import path from "path";
import fs from "fs-extra";

const { ADMIN_TOKEN, VIDEO_PATH } = process.env;

export default async (req, res) => {
  if (req.query.token !== ADMIN_TOKEN) {
    res.status(403).send("403 Forbidden");
    return;
  }
  const videoFilePath = path.join(VIDEO_PATH, req.params.anilistID, req.params.filename);
  if (!videoFilePath.startsWith(VIDEO_PATH)) {
    res.status(403).send("403 Forbidden");
    return;
  }
  console.log(`Deleting ${videoFilePath}`);
  fs.removeSync(videoFilePath);

  console.log(`Deleted ${videoFilePath}`);
  res.sendStatus(204);
};

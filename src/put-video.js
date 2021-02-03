import path from "path";
import fs from "fs-extra";

const { VIDEO_PATH } = process.env;

export default async (req, res) => {
  const videoFilePath = path.join(VIDEO_PATH, req.params.anilistID, req.params.filename);
  if (!videoFilePath.startsWith(VIDEO_PATH)) {
    res.status(403).send("403 Forbidden");
    return;
  }
  console.log(`Uploading ${videoFilePath}`);
  const status = fs.existsSync(videoFilePath) ? 201 : 204;
  fs.ensureDirSync(path.dirname(videoFilePath));

  req.pipe(fs.createWriteStream(videoFilePath));
  req.on("end", () => {
    res.sendStatus(status);
    console.log(`Uploaded ${videoFilePath}`);
  });
};

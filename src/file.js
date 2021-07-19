import path from "path";
import fs from "fs-extra";

const { VIDEO_PATH = "/mnt/" } = process.env;

export default async (req, res) => {
  const videoFilePath = path.join(VIDEO_PATH, req.params.anilistID, req.params.filename);
  if (!videoFilePath.startsWith(VIDEO_PATH)) {
    res.status(403).send("Forbidden");
    return;
  }
  if (req.method === "GET") {
    if (!fs.existsSync(videoFilePath)) {
      return res.status(404).send("Not found");
    }
    res.set("Content-Type", "video/mp4");
    res.send(fs.readFileSync(videoFilePath));
  } else if (req.method === "PUT") {
    console.log(`Uploading ${videoFilePath}`);
    fs.ensureDirSync(path.dirname(videoFilePath));
    req.pipe(fs.createWriteStream(videoFilePath));
    req.on("end", () => {
      res.sendStatus(204);
      console.log(`Uploaded ${videoFilePath}`);
    });
  } else if (req.method === "DELETE") {
    console.log(`Deleting ${videoFilePath}`);
    fs.removeSync(videoFilePath);

    console.log(`Deleted ${videoFilePath}`);
    res.sendStatus(204);
  }
};

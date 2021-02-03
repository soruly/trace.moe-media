import fs from "fs-extra";

const { VIDEO_PATH } = process.env;

export default async (req, res) => {
  if (!fs.existsSync(VIDEO_PATH)) {
    res.status(404).send("Not found");
    return;
  }
  res.json(fs.readdirSync(VIDEO_PATH));
};

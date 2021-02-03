import fs from "fs-extra";

const { ADMIN_TOKEN, VIDEO_PATH } = process.env;

export default async (req, res) => {
  if (req.query.token !== ADMIN_TOKEN) {
    res.status(403).send("403 Forbidden");
    return;
  }
  if (!fs.existsSync(VIDEO_PATH)) {
    res.status(404).send("Not found");
    return;
  }
  res.json(fs.readdirSync(VIDEO_PATH));
};

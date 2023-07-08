import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { VIDEO_PATH = "/mnt/" } = process.env;

export default async (req, res, next) => {
  if (!req.url.endsWith("/")) return next();
  const videoDirPath = path.join(VIDEO_PATH, req.path);
  if (!videoDirPath.startsWith(VIDEO_PATH)) {
    return res.status(403).send("Forbidden");
  }
  if (!fs.existsSync(videoDirPath)) {
    return res.status(404).send("Not found");
  }
  res.set(
    "Content-Security-Policy",
    [
      "default-src 'none'",
      "media-src 'self'",
      "style-src 'unsafe-inline'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
      "form-action 'none'",
      "block-all-mixed-content",
    ].join("; "),
  );
  res.set("Content-Type", "text/html");
  res.send(
    fs
      .readFileSync(path.join(__dirname, "admin.html"), "utf8")
      .replace(
        "<!-- content -->",
        [
          `<a href="${path.join(req.baseUrl, "/")}">..</a>`,
          ...fs
            .readdirSync(videoDirPath)
            .map((e) =>
              e.endsWith(".mp4")
                ? `<a href="${e}" target="_blank">${e}</a>`
                : `<a href="${path.join(e, "/")}">${e}</a>`,
            ),
        ].join("\n"),
      ),
  );
};

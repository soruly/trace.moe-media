const os = require("os");
const path = require("path");
const child_process = require("child_process");
const fs = require("fs-extra");
const {createCanvas, loadImage} = require("canvas");
const {getVideoDuration} = require("./get-video-duration.js");

const detectScene = async (filePath, t) => {
  if (t < 0) {
    return null;
  }

  const videoDuration = getVideoDuration(filePath);
  if (videoDuration === null || t > videoDuration) {
    return null;
  }

  const tBefore = 5;
  const tAfter = 5;
  let trimStart = t - tBefore;
  let trimEnd = t + tAfter;
  if (t - tBefore < 0) {
    trimStart = 0;
    trimEnd = tBefore + tAfter;
  }
  if (t + tAfter > videoDuration) {
    trimStart = videoDuration - tBefore - tAfter;
    trimEnd = videoDuration;
  }
  const fps = 12;
  const width = 32;
  const height = 18;

  const tempPath = path.join(os.tmpdir(), `videoPreview${process.hrtime().join("")}`);
  fs.removeSync(tempPath);
  fs.ensureDirSync(tempPath);
  const stdLog = child_process.spawnSync(
    "ffmpeg",
    [
      "-y",
      "-ss",
      trimStart,
      "-i",
      filePath,
      "-t",
      trimEnd - trimStart,
      "-an",
      "-vf",
      `fps=${fps},scale=${width}:${height},showinfo`,
      `${tempPath}/%04d.jpg`
    ],
    {encoding: "utf-8"}
  ).stderr;

  const myRe = /pts_time:\s*((\d|\.)+?)\s*pos/g;
  let temp = [];
  const timeCodeList = [];
  while ((temp = myRe.exec(stdLog)) !== null) {
    timeCodeList.push(parseFloat(temp[1]));
  }

  const imageDataList = await Promise.all(
    fs.readdirSync(tempPath)
      .map((file) => new Promise(async (resolve) => {
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        const image = await loadImage(path.join(tempPath, file));
        ctx.drawImage(image, 0, 0, width, height);
        resolve(ctx.getImageData(0, 0, width, height).data);
      })));
  fs.removeSync(tempPath);

  const getImageDiff = (a, b) => {
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff += Math.abs(a[i] - b[i]);
    }
    return Math.floor(diff / 1000);
  };

  const frameInfo = imageDataList
    .map((curr, index, array) => getImageDiff(curr, index ? array[index - 1] : curr))
    .map((curr, index) => ({
      id: index,
      diff: curr,
      timeCode: timeCodeList[index]
    }));

  const threshold = 50;
  let centerFrameID = Math.floor((t - trimStart) * fps);
  if (centerFrameID > frameInfo.length - 1) {
    centerFrameID = frameInfo.length - 1;
  }

  let startFrameID = centerFrameID;
  let endFrameID = centerFrameID;
  for (let i = centerFrameID; i >= 0; i--) {
    // compare with prev frame
    if (i === 0 || frameInfo[i].diff > threshold) {
      startFrameID = i;
      break;
    }
  }

  for (let i = centerFrameID === startFrameID ? centerFrameID + (0.5 * fps) : centerFrameID; i < frameInfo.length; i++) {
    // compare with next frame
    if (i + 1 === frameInfo.length || frameInfo[i + 1].diff > threshold) {
      endFrameID = i;
      break;
    }
  }

  // debug use
  // frameInfo[centerFrameID] = Object.assign(frameInfo[centerFrameID], {center:true});
  // frameInfo[startFrameID] = Object.assign(frameInfo[startFrameID], {start:true});
  // frameInfo[endFrameID] = Object.assign(frameInfo[endFrameID], {end:true});
  // console.log(frameInfo);
  const sceneTrimStart = trimStart + frameInfo[startFrameID].timeCode;
  const sceneTrimEnd = trimStart + frameInfo[endFrameID].timeCode;

  return {
    start: sceneTrimStart,
    end: sceneTrimEnd,
    duration: videoDuration
  };
};

module.exports = {detectScene};

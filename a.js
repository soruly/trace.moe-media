import fs from "fs-extra";
// import child_process from "child_process";
// const filePath = "/mnt/data/anime/1/AAC_multichannel_test.mp4";
// const trimStart = 10;
// const trimEnd = 20;
// const fps = 12;
// const width = 32;
// const height = 18;

// const ffmpeg = child_process.spawnSync(
//   "ffmpeg",
//   [
//     "-hide_banner",
//     "-loglevel",
//     "error",
//     "-nostats",
//     "-y",
//     "-ss",
//     trimStart - 10,
//     "-i",
//     filePath,
//     "-ss",
//     "10",
//     "-t",
//     trimEnd - trimStart,
//     "-an",
//     "-vf",
//     `fps=${fps},scale=${width}:${height}`,
//     "-c:v",
//     "rawvideo",
//     "-pix_fmt",
//     "yuv420p",
//     "-max_muxing_queue_size",
//     "1024",
//     "-map_metadata",
//     "-1",
//     "-map_chapters",
//     "-1",
//     "-f",
//     "nut",
//     "-",
//   ],
//   { maxBuffer: 1024 * 1024 * 100 }
// );
// if (ffmpeg.stderr.length) {
//   console.log(ffmpeg.stderr.toString());
// }
// console.log(ffmpeg.stdout);
// fs.outputFileSync("raw.video", ffmpeg.stdout);

const buf = fs.readFileSync("raw.video");
const header = buf.slice(0, 25).toString();
// console.log(header === "nut/multimedia container\0");
let i = 25;
while (i < buf.length - 1) {
  if (String.fromCharCode(buf[i]) === "N") {
    const startCode = buf.slice(i, i + 8);
    i += 8;
    switch (startCode.toString("hex")) {
      case "4e4d7a561f5f04ad": // main_startcode
        const version = buf[i++];
        const minor_version = buf[i++];
        const stream_count = buf[i++];
        const max_distance = buf[i++];
        const time_base_count = buf[i++];
        console.log(version, minor_version, stream_count, max_distance, time_base_count);
        var time_base = [];
        for (var x = 0; x < time_base_count; x++) {
          var time_base_num = buf[i++];
          var time_base_denom = buf[i++];
          time_base[x] = time_base_num / time_base_denom;
        }
        console.log(time_base);
        break;
      case "4e5311405bf2f9db": // stream_startcode
        const stream_id = buf[i++];
        const stream_class = buf[i++];
        const fourCC = buf.slice(i, i + 8);
        i += 8;
        const time_base_id = buf[i++];
        const msb_pts_shift = buf[i++];
        const max_pts_distance = buf[i++];
        const decode_delay = buf[i++];
        const stream_flags = buf[i++];
        i++;
        const width = buf[i++];
        const height = buf[i++];
        const sampleWidth = buf[i++];
        const sampleHeight = buf[i++];
        const colorspaceType = buf[i];
        i += 8;

        console.log(stream_id);
        console.log(stream_class);
        console.log(fourCC.toString());
        console.log(width, height, sampleWidth, sampleHeight, colorspaceType);
        break;
      case "4e49ab68b596ba78": // info_startcode
        // console.log("info_packet");
        break;
      case "4e4be4adeeca4569": // syncpoint_startcode
        // console.log("index");
        break;
      case "4e58dd672f23e64e": // index_startcode
        // console.log("syncpoint");
        break;
    }
    // packet_footer;
  } else {
    const frame_code = buf[i];
    console.log(frame_code);
    // console.log(`0x${i.toString(16)} : ${buf[i].toString(16)}`);
    i++;
  }
}

# trace.moe-media

[![License](https://img.shields.io/github/license/soruly/trace.moe-media.svg?style=flat-square)](https://github.com/soruly/trace.moe-media/blob/master/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/soruly/trace.moe-media/Docker%20Image%20CI?style=flat-square)](https://github.com/soruly/trace.moe-media/actions)
[![Docker](https://img.shields.io/docker/pulls/soruly/trace.moe-media?style=flat-square)](https://hub.docker.com/r/soruly/trace.moe-media)
[![Docker Image Size](https://img.shields.io/docker/image-size/soruly/trace.moe-media/latest?style=flat-square)](https://hub.docker.com/r/soruly/trace.moe-media)
[![Discord](https://img.shields.io/discord/437578425767559188.svg?style=flat-square)](https://discord.gg/K9jn6Kj)

### Media server for serving video preview for trace.moe

This server uses a "video scene cutter" which automatically detect timestamp boundaries of a shot, and then trim the shot out without leaking / exposing other frames that belongs to previous / next scenes. Currently this is used by the website [trace.moe](https://trace.moe) and its Telegram Bot [@whatanimebot](http://t.me/whatanimebot).

#### Background of this project

When search result from trace.moe returns an anime, episode and a timecode, it can generate a video preview for the scene at that time code.

Query image:

![](https://images.plurk.com/3F4Mg666qw78rImF7DR2SG.jpg)

Search result: `Shelter, episode 1, timecode: 00:00:51.83`

Video Preview at time `00:00:51.83`

|           Fixed offset without trace.moe-media           |             Auto detect with trace.moe-media             |
| :------------------------------------------------------: | :------------------------------------------------------: |
| ![](https://images.plurk.com/7lURadxyYVrvPl52M7mm3G.gif) | ![](https://images.plurk.com/2mcJxwtMJFSVhLQ8XDUYI3.gif) |
|            00:50.93 (-0.9) to 00:53.93 (+2.1)            |              00:49.22 to 00:51.30 (dynamic)              |

By using first / last frames from the fixed offset preview, user may be able to use that to search again and reveal previous/next scene of the original video. By repeating this process, users may eventually read the whole video until the rate limit/search quota used up.

With the video preview generated by auto detect method, searching any frame form the preview would only results the same video preview. This prevents leaking the previous/next scene.

### How does it work

To be completed
![](https://images.plurk.com/2NDcHsv4PFLWX5q64zHts7.jpg)

### Getting Started

```bash
docker run -it --init --rm -v /path/to/video/=/mnt/ -p 3000:3000 ghcr.io/soruly/trace.moe-media:latest
```

#### List files

```
http://127.0.0.1:3000/list/
```

#### Video URL

```
http://127.0.0.1:3000/file/foo/bar.mp4
```

For this URL endpoint, use HTTP Method PUT, DELETE to upload and delete files.

To secure this endpoint, define the `TRACE_API_SECRET` environment variable, and put `x-trace-secret` in HTTP header when sending requests.

#### Video Preview URL

```
http://127.0.0.1:3000/video/foo/bar.mp4?t=87
```

You can use the `&size=` param to specify preview size (l: 640, m: 320, s: 160)

```
http://127.0.0.1:3000/video/foo/bar.mp4?t=87&size=l
```

You can use the `&mute` param to generate a muted video (like GIF)

```
http://127.0.0.1:3000/video/foo/bar.mp4?t=87&size=l&mute
```

#### Image Preview URL

```
http://127.0.0.1:3000/image/foo/bar.mp4?t=87
```

You can use the `&size=` param to specify preview size (l: 640, m: 320, s: 160)

```
http://127.0.0.1:3000/image/foo/bar.mp4?t=87&size=l
```

### Environment variables

```
VIDEO_PATH=         # e.g. /mnt/data/anilist/
SERVER_PORT=        # e.g. 3001
SERVER_ADDR=        # e.g. 127.0.0.1 or 0.0.0.0
TRACE_MEDIA_SALT=   # define any random string, or leave blank to disable secure token
TRACE_API_SECRET=   # same as TRACE_API_SECRET in trace.moe api's .env, or leave blank to disable auth
```

### Local Development

Git clone this repository, npm install, copy `.env.example` to `.env`, Edit `.env` as you need, then start server

```
node server.js
```

You also can use pm2 to run this in background in cluster mode.

Use below commands to start / restart / stop server.

```
npm run start
npm run stop
npm run reload
npm run restart
npm run delete
```

To change the number of nodejs instances, edit ecosystem.config.json

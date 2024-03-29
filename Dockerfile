# syntax=docker/dockerfile:1

FROM node:lts-bookworm-slim
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]
RUN apt-get update && apt-get install -y ffmpeg
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --omit=dev
COPY src/ ./src/
COPY server.js ./
CMD [ "node", "server.js" ]
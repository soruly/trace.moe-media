# syntax=docker/dockerfile:1

FROM node:lts-buster-slim
RUN apt-get update && apt-get install -y ffmpeg
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY src/ ./src/
COPY server.js ./
CMD [ "node", "server.js" ]
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5010
ENV DATA_FILE=/data/db.json

COPY package.json ./
COPY backend ./backend
COPY apps ./apps
COPY mobile ./mobile

RUN mkdir -p /data && chown -R node:node /data /app

USER node

EXPOSE 5010

CMD ["node", "backend/server.js"]

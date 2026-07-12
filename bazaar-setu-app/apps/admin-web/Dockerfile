FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY services ./services

RUN npm ci --legacy-peer-deps
RUN npm --workspace apps/admin-web run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/admin-web ./apps/admin-web
COPY --from=build /app/packages ./packages

EXPOSE 3000

CMD ["npm", "--workspace", "apps/admin-web", "run", "start"]

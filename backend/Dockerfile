FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN pnpm prisma generate && pnpm build

FROM base AS runtime
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 4000

CMD ["sh", "-c", "pnpm db:deploy && node dist/server.js"]

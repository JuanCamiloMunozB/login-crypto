# Stage 1: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: build the Next.js app
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: lightweight production image
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
# Copy build artifacts owned by the unprivileged "node" user that ships with the image.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Run as non-root (least privilege).
USER node
EXPOSE 3000
CMD ["node", "server.js"]

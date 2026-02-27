# Stage 1: Builder
FROM node:22-alpine AS builder

# Prisma butuh openssl di Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy file package untuk install dependency
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

COPY . .

# Build Nuxt (Output akan ada di folder .output)
RUN npm run build

# Stage 2: Runner (Production)
FROM node:22-alpine

RUN apk add --no-cache openssl
WORKDIR /app

# Ambil hasil build Nitro server dari stage builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
# Copy folder prisma jika Anda butuh menjalankan migrasi di server
COPY --from=builder /app/prisma ./prisma

# Nuxt engine default port
ENV NODE_ENV=production
ENV PORT=8880

EXPOSE 8880

# Jalankan server Nitro bawaan Nuxt
CMD [ "node", ".output/server/index.mjs" ]
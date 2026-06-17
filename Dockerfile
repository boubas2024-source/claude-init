# ─── Étape 1 : dépendances ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm ci --ignore-scripts

# ─── Étape 2 : build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Build Next.js (standalone)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Étape 3 : image de production ────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl curl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copier le build standalone
COPY --from=builder /app/public             ./public
COPY --from=builder --chown=nextjs:nodejs \
     /app/.next/standalone                  ./
COPY --from=builder --chown=nextjs:nodejs \
     /app/.next/static                      ./.next/static
COPY --from=builder /app/prisma             ./prisma
COPY --from=builder /app/node_modules/.prisma \
                                            ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma \
                                            ./node_modules/@prisma

# Dossier uploads persistant
RUN mkdir -p ./public/uploads && chown nextjs:nodejs ./public/uploads

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

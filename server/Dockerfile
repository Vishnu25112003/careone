# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy the manifests AND the Prisma schema before installing. `prisma generate`
# needs the schema, and package.json declares a `postinstall: prisma generate`.
COPY package.json package-lock.json ./
COPY prisma ./prisma

# --ignore-scripts: postinstall would run `prisma generate` here with an
# incomplete tree. Generation happens explicitly below instead.
RUN npm ci --ignore-scripts

COPY . .

# Generate the Prisma client ONCE, here. DATABASE_URL only has to parse — no
# database connection is made at generate time — so a dummy value is correct.
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine

# Prisma's query engine links against OpenSSL 3 on Alpine.
RUN apk add --no-cache openssl

WORKDIR /app

# The source, node_modules and the generated Prisma client, all from the
# builder. There is no separate `npm ci --omit=dev` step here (C2K has one)
# because this COPY overwrites node_modules wholesale, making that install dead
# work — and server/package.json declares no devDependencies to prune anyway.
COPY --from=builder /app ./

EXPOSE 5000

RUN chmod +x /app/docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]

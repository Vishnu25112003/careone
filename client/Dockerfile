# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines env vars at BUILD time, so the API base URL is baked into the
# bundle here — it cannot be changed by restarting the container.
# The default is a relative path: nginx serves the API from the same origin.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM nginx:1.27-alpine

# Only the compiled site ships in the image. The nginx configuration is bind
# mounted from ./nginx by docker-compose.yml, so a config tweak is a reload
# rather than an image rebuild.
COPY --from=builder /app/dist /var/www/site

EXPOSE 80

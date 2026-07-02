FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
EXPOSE 8080
CMD ["/app/docker-entrypoint.sh"]

# stage 1
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

# stage 2
FROM nginx:1.23.2-alpine AS final
COPY --from=build /app/build /usr/share/nginx/html

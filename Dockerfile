FROM node:22.14.0-alpine3.21 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install
RUN npm run build

FROM node:22.14.0-alpine3.21
WORKDIR /usr/src/app
RUN apk update
RUN apk add curl
RUN apk add inetutils-telnet
COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
EXPOSE 3000
EXPOSE 3443
CMD ["node", "dist/server.js"]
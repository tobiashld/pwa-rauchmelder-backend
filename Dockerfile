FROM node:latest as build

WORKDIR /app
COPY package*.json /app/
RUN npm install
RUN npm install pm2 prisma -g
COPY ./ /app/
RUN prisma generate --schema=/app/prisma/schema.prisma
RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
COPY /dist /app/dist
EXPOSE 3200
CMD ["pm2-runtime", "dist/index.js"]
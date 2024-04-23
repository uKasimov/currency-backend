# Adapted from https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

FROM node:16
WORKDIR /usr/src/app

# install dependencies
COPY package*.json ./
RUN npm i

# bundle app source
COPY . .

# generate prisma client
RUN npx prisma generate

EXPOSE 3001

CMD [ "npm", "run", "start:prod" ]

FROM node:10
RUN npm install webpack -g

WORKDIR /tmp
COPY package.json /tmp/

RUN npm install --only=dev

WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN cp -a /tmp/node_modules /usr/src/app/

ENV PORT=8080
EXPOSE 8080

RUN npm run config

CMD npm start

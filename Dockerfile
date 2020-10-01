FROM node:12

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY src /usr/src/
COPY .docker/node_modules/ /usr/src/node_modules/
COPY package.json /usr/src/
COPY tsconfig.json /usr/src/

CMD node_modules/ts-node/dist/bin.js index.ts

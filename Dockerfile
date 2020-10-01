FROM node:12

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY src /usr/src/
COPY package.json /usr/src/
COPY tsconfig.json /usr/src/
COPY .docker/node_modules/ /usr/src/node_modules/

CMD node_modules/ts-node/dist/bin.js index.ts

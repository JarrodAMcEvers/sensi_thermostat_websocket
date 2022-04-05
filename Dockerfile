FROM node:16

WORKDIR /usr/src/
USER node

COPY --chown=node:node src /usr/src/
COPY --chown=node:node package.json /usr/src/
COPY --chown=node:node tsconfig.json /usr/src/
COPY --chown=node:node .docker/node_modules/ /usr/src/node_modules/

CMD node_modules/ts-node/dist/bin.js index.ts

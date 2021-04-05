#! /bin/bash

.PHONY: build cleanup install run repl test use

use:
	nvm install
install: use
	npm install
start:
	./node_modules/ts-node/dist/bin.js src/index.ts

test:
	./node_modules/jest/bin/jest.js

build:
	rm -rf .docker
	mkdir -p .docker
	cp {package.json,package-lock.json} .docker/
	npm ci --only production --prefix .docker/
	docker build -t sensi_websocket ./
run: cleanup build
	docker run --env-file ./env -d --name sensi_websocket sensi_websocket
up:
	docker-compose up -d
down:
	docker-compose down

cleanup:
	docker rm -f sensi_websocket

repl:
	./node_modules/ts-node/dist/bin.js
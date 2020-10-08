#! /bin/bash

.PHONY: build install run test use

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
	cp package.json .docker/
	npm install --prefix .docker/ --only prod
	docker build -t sensi_websocket ./
run:
	docker run -d --name sensi_websocket sensi_websocket
up:
	docker-compose up -d
down:
	docker-compose down

cleanup:
	rm -rf .docker


#! /bin/bash

.PHONY: test
test:
	./node_modules/jest/bin/jest.js

start:
	./node_modules/ts-node/dist/bin.js src/index.ts

docker-build:
	mkdir -p .docker
	cp package.json .docker/
	npm install --prefix .docker/ --only prod
	docker build -t sensi_websocket ./
docker-run:
	docker run -d --name sensi_websocket sensi_websocket
up:
	docker-compose up -d
down:
	docker-compose down

cleanup:
	rm -rf .docker


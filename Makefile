#! /bin/bash

.PHONY: test
test:
	./node_modules/jest/bin/jest.js

start:
	./node_modules/ts-node/dist/bin.js src/index.ts

build:
	mkdir -p .docker
	cp package.json .docker/
	npm install --prefix .docker/ --only prod

cleanup:
	rm -rf .docker

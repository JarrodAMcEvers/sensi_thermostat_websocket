#! /bin/bash
DIR=.
.PHONY: build cleanup install lint lint_fix run repl test use

use:
	[ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh" || [ -s "/usr/local/opt/nvm/nvm.sh" ] && . "/usr/local/opt/nvm/nvm.sh" && nvm use
install: use
	npm install
start:
	./node_modules/ts-node/dist/bin.js src/index.ts
test:
	./node_modules/jest/bin/jest.js
lint:
	./node_modules/eslint/bin/eslint.js ${DIR}
lint_fix:
	./node_modules/eslint/bin/eslint.js ${DIR} --fix
repl:
	./node_modules/ts-node/dist/bin.js

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

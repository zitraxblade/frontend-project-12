install:
	npm ci
	cd frontend && npm ci

build:
	cd frontend && npm run build

start:
	npx start-server -a 0.0.0.0 -p $$PORT -s ./frontend/dist
build:
	cd frontend && npm ci && npm run build

start:
	npx start-server -p $$PORT -s ./frontend/dist
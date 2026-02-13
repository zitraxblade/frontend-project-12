build:
	cd frontend && npm ci && npm run build

start:
	./node_modules/.bin/start-server -a 0.0.0.0 -p $$PORT -s ./frontend/dist
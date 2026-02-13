build:
	cd frontend && npm ci && npm run build

start:
	echo "PWD=$$(pwd)"
	echo "PORT=$$PORT"
	ls -la
	ls -la ./frontend || true
	ls -la ./frontend/dist || true
	ls -la ./frontend/dist/index.html || true
	npx start-server -a 0.0.0.0 -p $$PORT -s ./frontend/dist
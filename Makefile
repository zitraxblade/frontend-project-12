build:
	cd frontend && npm ci && npm run build

start:
	echo "PORT=$$PORT"
	# стартуем сервер в фоне
	npx start-server -a 0.0.0.0 -p $$PORT -s ./frontend/dist &
	# ждём секунду и проверяем, слушает ли порт ВНУТРИ контейнера
	sleep 1
	echo "=== internal check / ==="
	curl -i http://127.0.0.1:$$PORT/ || true
	echo "=== internal check /api ==="
	curl -i http://127.0.0.1:$$PORT/api/v1/channels || true
	# возвращаем сервер в foreground
	wait
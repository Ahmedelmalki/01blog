BACKEND_DIR = backend
DOCKER_COMPOSE = $(BACKEND_DIR)/docker-compose.yml

.PHONY: build up down logs restart clean run dev prod

# Development mode (hot reload)
dev:
	docker compose -f $(DOCKER_COMPOSE) up

# Production build
prod:
	docker compose -f $(DOCKER_COMPOSE) --profile prod up --build

build:
	docker compose -f $(DOCKER_COMPOSE) build

down:
	docker compose -f $(DOCKER_COMPOSE) down

logs:
	docker compose -f $(DOCKER_COMPOSE) logs -f

restart: down dev

clean:
	docker system prune -af
	docker volume rm backend_maven-cache 2>/dev/null || true

run: build up logs

enter:
	mysql -h 127.0.0.1 -u 01blog -p01blogpass
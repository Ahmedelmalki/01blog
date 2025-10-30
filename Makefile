# Makefile to control Docker for backend service from parent directory

BACKEND_DIR = backend
DOCKER_COMPOSE = $(BACKEND_DIR)/docker-compose.yml

.PHONY: build up down logs restart clean run

build:
	docker compose -f $(DOCKER_COMPOSE) build

up:
	docker compose -f $(DOCKER_COMPOSE) up 

down:
	docker compose -f $(DOCKER_COMPOSE) down

logs:
	docker compose -f $(DOCKER_COMPOSE) logs -f

restart: down up

clean:
	docker system prune -af

run: build up logs

enter:
	mysql -h 127.0.0.1 -u 01blog -p01blogpass

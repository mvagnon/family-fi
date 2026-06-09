BUN ?= bun
COMPOSE ?= docker compose
FAMILY_FI_API_UPSTREAM_ORIGIN ?= http://localhost:3001
VITE_HUB_ORIGIN ?= http://localhost:5173

.PHONY: dev bun-dev docker-up docker-down docker-logs docker-ps

dev: docker-up bun-dev

bun-dev:
	FAMILY_FI_API_UPSTREAM_ORIGIN="$(FAMILY_FI_API_UPSTREAM_ORIGIN)" VITE_HUB_ORIGIN="$(VITE_HUB_ORIGIN)" $(BUN) run dev

docker-up:
	$(COMPOSE) up --build -d api

docker-down:
	$(COMPOSE) down

docker-logs:
	$(COMPOSE) logs -f api

docker-ps:
	$(COMPOSE) ps

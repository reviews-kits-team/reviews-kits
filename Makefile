.PHONY: dev stop

dev:
	@echo "Starting infrastructure..."
	docker compose -f infra/docker-compose.dev.yml up -d
	@echo "Waiting for database to be ready..."
	@until docker compose -f infra/docker-compose.dev.yml exec db pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "Pushing database schema..."
	cd apps/server && bun run db:push
	@echo "Starting dev server..."
	bun run dev

stop:
	docker compose -f infra/docker-compose.dev.yml down

# AstraFund Docker Development Makefile

.PHONY: help build up down logs shell seed clean restart

# Default target
help:
	@echo "AstraFund Docker Development Commands:"
	@echo ""
	@echo "  make up          - Start development environment"
	@echo "  make down        - Stop all services"
	@echo "  make build       - Build all containers"
	@echo "  make logs        - View logs from all services"
	@echo "  make shell       - Access backend container shell"
	@echo "  make seed        - Seed database with sample data"
	@echo "  make clean       - Clean up containers and volumes"
	@echo "  make restart     - Restart all services"
	@echo "  make status      - Show container status"
	@echo ""

# Start development environment
up:
	docker-compose -f docker-compose.dev.yml up --build

# Start in background
up-d:
	docker-compose -f docker-compose.dev.yml up -d --build

# Stop all services
down:
	docker-compose -f docker-compose.dev.yml down

# Build containers
build:
	docker-compose -f docker-compose.dev.yml build

# View logs
logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Backend logs only
logs-backend:
	docker-compose -f docker-compose.dev.yml logs -f backend

# Frontend logs only
logs-frontend:
	docker-compose -f docker-compose.dev.yml logs -f frontend

# Access backend shell
shell:
	docker-compose -f docker-compose.dev.yml exec backend bash

# Seed database
seed:
	docker-compose -f docker-compose.dev.yml exec backend python seed_docker.py

# Clean up everything
clean:
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

# Restart services
restart: down up

# Show container status
status:
	docker-compose -f docker-compose.dev.yml ps

# Production commands
prod-up:
	docker-compose up -d --build

prod-down:
	docker-compose down

prod-logs:
	docker-compose logs -f

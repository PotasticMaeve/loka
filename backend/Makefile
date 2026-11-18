SHELL   := /bin/bash
COMPOSE ?= docker compose
BACKEND ?= loka_backend
DB      ?= loka_db
DOMAIN  ?= loka-backend.claudiafelicia.com

.DEFAULT_GOAL := help
.PHONY: help up down restart ps logs sh dbshell health pull deploy migrate migrate-status seed reset-db

help:
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart $(BACKEND)

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f --tail=100 $(BACKEND)

sh:
	$(COMPOSE) exec $(BACKEND) sh

dbshell:
	$(COMPOSE) exec $(DB) sh -c 'psql -U $$POSTGRES_USER -d $$POSTGRES_DB'

health:
	@curl -sS -m 10 https://$(DOMAIN)/api/health; echo

pull:
	$(COMPOSE) pull

deploy: pull up ps health

migrate:
	$(COMPOSE) exec $(BACKEND) npx prisma migrate deploy

migrate-status:
	$(COMPOSE) exec $(BACKEND) npx prisma migrate status

seed:
	$(COMPOSE) exec $(BACKEND) npx prisma db seed

reset-db:
	@read -p "Ini menghapus SELURUH isi $(DB). Ketik 'hapus' untuk lanjut: " ans; \
	if [ "$$ans" != "hapus" ]; then echo "dibatalkan"; exit 1; fi
	$(COMPOSE) exec $(BACKEND) npx prisma migrate reset --force
	$(COMPOSE) exec $(BACKEND) npx prisma db seed

#!/bin/sh
set -e

alembic upgrade head

celery -A app.workers.celery_app worker \
  --loglevel=info \
  --queues=documents \
  --concurrency=2 &

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"

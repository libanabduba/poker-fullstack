#!/bin/bash

# Database migration script
set -e

echo "Running database migrations..."

# Wait for database to be ready
until psql "$DB_DSN" -c '\q' 2>/dev/null; do
  echo "Waiting for database..."
  sleep 1
done

echo "Database is ready, running migrations..."

# Run migrations
for migration in migrations/*.sql; do
  if [ -f "$migration" ]; then
    echo "Running migration: $migration"
    psql "$DB_DSN" -f "$migration"
  fi
done

echo "Migrations completed!"


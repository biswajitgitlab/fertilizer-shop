#!/bin/sh
set -e

# Wait for database / run migrations and seeders on container startup
echo "==> Running Laravel Migrations..."
php artisan migrate --force

echo "==> Running Database Seeders..."
php artisan db:seed --force || echo "Seeding completed or skipped."

# Execute main process (CMD)
exec "$@"

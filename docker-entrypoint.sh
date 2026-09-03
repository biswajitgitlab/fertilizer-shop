#!/bin/sh
set -e

# Wait for database / run migrations and seeders on container startup
echo "==> Running Laravel Migrations..."
php artisan migrate --force


# Execute main process (CMD)
exec "$@"

#!/bin/sh
set -e

# Render default PORT fallback
export PORT="${PORT:-10000}"

echo "==> Configuring Nginx port to ${PORT}..."
mkdir -p /etc/nginx/conf.d
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Optimize Laravel cache and routes for production
echo "==> Caching Laravel routes, config, and views..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true
php artisan event:cache || true

# Wait for database / run migrations on container startup
echo "==> Running Laravel Migrations..."
php artisan migrate --force || true

echo "==> Starting PHP-FPM and Nginx..."
php-fpm -D
exec nginx -g 'daemon off;'

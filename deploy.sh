#!/bin/bash

set -e

APP_DIR="/var/www/waba-api"

cd "$APP_DIR"

echo "==> Atualizando código"
git fetch origin main
git reset --hard origin/main

echo "==> Instalando dependências"
npm ci

echo "==> Build"
npm run build

echo "==> Reiniciando PM2"
pm2 reload waba-api

echo "==> Deploy finalizado"
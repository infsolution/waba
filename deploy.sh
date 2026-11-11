#!/bin/bash
set -euo pipefail

APP_DIR="/var/www/waba-api"
APP_NAME="waba-api"
HEALTH_URL="http://localhost:3000/health" # <-- TROCA PELA SUA PORTA / ROTA DE HEALTH
BACKUP_BASE="/home/cicero/backups/waba-api"
BACKUP_SUFIX="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$BACKUP_BASE/dist-$BACKUP_SUFIX"

echo "==> Entrar no document root"
cd "$APP_DIR"

echo "==> Backup do dist atual (para rollback rápido)"
if [ -d "dist" ]; then
  cp -r dist "$BACKUP_DIR"
  echo "Backup em: $BACKUP_DIR"
fi

echo "==> Atualizando código"
git fetch origin main
git reset --hard origin/main

echo "==> Instalando dependências"
# Limpa o bloqueio de install-scripts que estava matando o prisma e o bcrypt
# Se você usa .npmrc com allowScripts, isso aqui garante que o prisma rode
npm ci

echo "==> Gerando prisma Client (OBRIGATÓRIO)"
npx  generate

echo "==> Rodando migrations (se houver)"
# Se você não usa migrate em produção, pode comentar essa linha
# Mas NÃO rode ' db push' em produção
npx prisma migrate deploy || echo "⚠️ Nenhuma migration pendente ou erro ao aplicar - verifique"

echo "==> Build - se falhar aqui, o deploy PARA e não reinicia o PM2"
npm run build

# Validação extra: garante que o dist foi gerado de verdade
if [ ! -f "dist/main.js" ]; then
  echo "❌ ERRO: dist/main.js não foi gerado. Abortando deploy."
  exit 1
fi

echo "==> Reiniciando PM2"
pm2 reload "$APP_NAME" --update-env

echo "==> Aguardando API subir..."
sleep 5

echo "==> Healthcheck"
# Tenta 10 vezes, com 3s de intervalo
for i in {1..10}; do
  if curl -sf "$HEALTH_URL" > /dev/null; then
    echo "✅ API respondeu no healthcheck!"
    echo "==> Deploy finalizado com sucesso"
    exit 0
  fi
  echo "Tentativa $i/10 falhou, aguardando..."
  sleep 3
done

echo "❌ Healthcheck falhou após 30s. Fazendo rollback..."
if [ -d "$BACKUP_DIR" ]; then
  rm -rf dist
  cp -r "$BACKUP_DIR-" dist
  pm2 reload "$APP_NAME" --update-env
  echo "Rollback feito para o dist anterior."
fi
exit 1
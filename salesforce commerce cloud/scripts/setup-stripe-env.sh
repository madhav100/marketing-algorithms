#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/salesforce commerce cloud/.env.local"

if [[ -f "$ENV_FILE" ]]; then
  read -r -p ".env.local already exists. Overwrite? (y/N): " confirm
  if [[ "${confirm:-N}" != "y" && "${confirm:-N}" != "Y" ]]; then
    echo "Aborted. Existing .env.local was not changed."
    exit 0
  fi
fi

read -r -p "Enter Stripe publishable key (pk_test_...): " STRIPE_PUBLISHABLE_KEY
read -rs -p "Enter Stripe secret key (sk_test_...): " STRIPE_SECRET_KEY
printf '\n'
read -rs -p "Enter Stripe webhook secret (whsec_..., optional): " STRIPE_WEBHOOK_SECRET
printf '\n'

cat > "$ENV_FILE" <<ENVVARS
STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
ENVVARS

chmod 600 "$ENV_FILE"
echo ".env.local created successfully at: $ENV_FILE"

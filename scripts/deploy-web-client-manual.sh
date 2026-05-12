#!/usr/bin/env bash
#
# Manual deploy script for Voyager Web Client → S3 (+ optional CloudFront invalidation).
#
# Las variables VITE_* ya quedaron compiladas en los assets durante el build
# en GitHub Actions, así que aquí solo se sube el contenido de dist/ al bucket
# con los cache headers adecuados.
#
# Usage:
#   ./scripts/deploy-web-client-manual.sh <web-client-dist.tar.gz-path>
#
# Variables de entorno:
#   FRONTEND_BUCKET            (default: smarttrip-frontend-bucket)
#   AWS_REGION                 (default: us-east-1)
#   CLOUDFRONT_DISTRIBUTION_ID (opcional: si está, invalida /*)
#   DRY_RUN=1                  (opcional: imprime los comandos sin subir nada)
#   NO_DELETE=1                (opcional: no borra del bucket lo que no esté en dist/)
#
# Ejemplos:
#   sudo ./scripts/deploy-web-client-manual.sh release/web-client-dist.tar.gz
#   FRONTEND_BUCKET=mi-bucket ./scripts/deploy-web-client-manual.sh release/web-client-dist.tar.gz
#   CLOUDFRONT_DISTRIBUTION_ID=E1ABCXYZ ./scripts/deploy-web-client-manual.sh release/web-client-dist.tar.gz
#   DRY_RUN=1 ./scripts/deploy-web-client-manual.sh release/web-client-dist.tar.gz

set -euo pipefail

PACKAGE_PATH="${1:-}"
FRONTEND_BUCKET="${FRONTEND_BUCKET:-smarttrip-frontend-bucket}"
AWS_REGION="${AWS_REGION:-us-east-1}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
DRY_RUN="${DRY_RUN:-0}"
NO_DELETE="${NO_DELETE:-0}"

log() { echo "[$(date -Iseconds)] $*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

usage() {
  cat <<EOF
Usage: $0 <web-client-dist.tar.gz-path>

Env (opcional):
  FRONTEND_BUCKET             default smarttrip-frontend-bucket
  AWS_REGION                  default us-east-1
  CLOUDFRONT_DISTRIBUTION_ID  invalidación CloudFront tras el upload
  DRY_RUN=1                   imprime comandos sin ejecutar el sync/invalidate
  NO_DELETE=1                 no borra del bucket lo que no esté en dist/
EOF
}

# ---------------------------------------------------------------------------
# Validaciones
# ---------------------------------------------------------------------------

if [[ -z "$PACKAGE_PATH" ]]; then
  usage
  exit 1
fi
[[ -f "$PACKAGE_PATH" ]] || die "Artefacto no encontrado: $PACKAGE_PATH"

command -v aws >/dev/null 2>&1 \
  || die "AWS CLI no instalado. Instálalo o ejecuta esto desde CloudShell."

command -v tar >/dev/null 2>&1 || die "Falta el binario 'tar'."

if [[ "$DRY_RUN" != "1" ]]; then
  log "Verificando credenciales AWS..."
  aws sts get-caller-identity --region "$AWS_REGION" >/dev/null \
    || die "Credenciales AWS inválidas o expiradas (Learner Lab caduca cada ~4h)."
  log "Verificando que el bucket '$FRONTEND_BUCKET' existe y es accesible..."
  aws s3api head-bucket --bucket "$FRONTEND_BUCKET" --region "$AWS_REGION" 2>/dev/null \
    || die "Bucket '$FRONTEND_BUCKET' no existe o no tienes permisos. Crea el bucket o ajusta FRONTEND_BUCKET."
fi

# ---------------------------------------------------------------------------
# Extracción del paquete
# ---------------------------------------------------------------------------

TMP_DIR="$(mktemp -d -t voyager-web-deploy-XXXXXXXX)"
# El trap solo limpia tras un EXIT exitoso. En caso de error, dejamos el dir
# en disco para que puedas inspeccionarlo (la ruta sale en el log).
cleanup() {
  local exit_code=$?
  if [[ "$exit_code" -eq 0 ]]; then
    rm -rf "$TMP_DIR"
  else
    echo "Deploy falló. Archivos extraídos quedaron en: $TMP_DIR" >&2
  fi
}
trap cleanup EXIT

log "Extrayendo $PACKAGE_PATH en $TMP_DIR ..."
tar -xzf "$PACKAGE_PATH" -C "$TMP_DIR"

DIST_DIR="$TMP_DIR/dist"
[[ -d "$DIST_DIR" ]] || die "El artefacto no contiene un directorio dist/."

# Información embebida en el bundle (no afecta funcionalidad, útil para auditoría).
cat > "$DIST_DIR/deployment-info.txt" <<EOF
Deployment Information
======================
Target S3 Bucket : $FRONTEND_BUCKET
AWS Region       : $AWS_REGION
Build Timestamp  : $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Source Package   : $(basename "$PACKAGE_PATH")
Build Environment: GitHub Actions (VITE_* compiladas en build time)
EOF

# ---------------------------------------------------------------------------
# Sync a S3 con cache headers diferenciados:
#   - assets/* tienen hash en el nombre (Vite) → cache inmutable 1 año.
#   - HTML / favicon / logos → no-cache para que el CDN/cliente revaliden.
# ---------------------------------------------------------------------------

S3_TARGET="s3://${FRONTEND_BUCKET}/"
DELETE_FLAG=""
if [[ "$NO_DELETE" != "1" ]]; then
  DELETE_FLAG="--delete"
fi
DRYRUN_FLAG=""
if [[ "$DRY_RUN" == "1" ]]; then
  DRYRUN_FLAG="--dryrun"
fi

log "Subiendo assets/* con cache inmutable (1 año)..."
aws s3 sync "$DIST_DIR/" "$S3_TARGET" \
  --region "$AWS_REGION" \
  $DRYRUN_FLAG \
  --exclude "*" \
  --include "assets/*" \
  --cache-control "public, max-age=31536000, immutable"

log "Subiendo el resto con no-cache (HTML, logos, manifest)..."
aws s3 sync "$DIST_DIR/" "$S3_TARGET" \
  --region "$AWS_REGION" \
  $DRYRUN_FLAG \
  $DELETE_FLAG \
  --exclude "assets/*" \
  --cache-control "no-cache, no-store, must-revalidate"

# ---------------------------------------------------------------------------
# Invalidación CloudFront (opcional)
# ---------------------------------------------------------------------------

if [[ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]]; then
  if [[ "$DRY_RUN" == "1" ]]; then
    log "DRY_RUN: omito invalidación de CloudFront en $CLOUDFRONT_DISTRIBUTION_ID"
  else
    log "Invalidando CloudFront ($CLOUDFRONT_DISTRIBUTION_ID) /* ..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
      --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
      --paths "/*" \
      --query 'Invalidation.Id' \
      --output text)
    log "Invalidación creada: $INVALIDATION_ID (suele tardar 1-3 min)."
  fi
fi

# ---------------------------------------------------------------------------
# Resumen
# ---------------------------------------------------------------------------

if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN completo. No se subió nada al bucket."
  exit 0
fi

WEB_ENDPOINT=$(aws s3api get-bucket-website \
  --bucket "$FRONTEND_BUCKET" \
  --region "$AWS_REGION" 2>/dev/null \
  | grep -oE '"IndexDocument"[^}]*' || true)

OBJECT_COUNT=$(aws s3 ls "s3://${FRONTEND_BUCKET}/" \
  --recursive --region "$AWS_REGION" \
  | wc -l | tr -d '[:space:]')

log "Deploy completado."
echo
echo "  Bucket          : s3://${FRONTEND_BUCKET}/ (region $AWS_REGION)"
echo "  Objetos en raíz : $OBJECT_COUNT"
if [[ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]]; then
  echo "  CloudFront      : $CLOUDFRONT_DISTRIBUTION_ID (invalidado /*)"
fi
echo "  Website hosting : $([[ -n "$WEB_ENDPOINT" ]] && echo "configurado" || echo "no configurado en este bucket")"
echo
echo "  Endpoint S3 (sin CloudFront):"
echo "    http://${FRONTEND_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"

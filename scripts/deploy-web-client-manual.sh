#!/usr/bin/env bash
set -euo pipefail

# Manual deploy for AWS Academy / Learner Lab
# Requires local AWS CLI auth already active (temporary credentials).
#
# Usage:
#   ./scripts/deploy-web-client-manual.sh /path/to/web-client-dist.tar.gz
#
# Optional env vars:
#   AWS_REGION=us-east-1
#   FRONTEND_BUCKET=smarttrip-frontend-bucket
#   CLOUDFRONT_DISTRIBUTION_ID=E123456789

PACKAGE_PATH="${1:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"
FRONTEND_BUCKET="${FRONTEND_BUCKET:-smarttrip-frontend-bucket}"

if [[ -z "${PACKAGE_PATH}" ]]; then
  echo "Usage: $0 <web-client-dist.tar.gz-path>"
  exit 1
fi

if [[ ! -f "${PACKAGE_PATH}" ]]; then
  echo "Artifact not found: ${PACKAGE_PATH}"
  exit 1
fi

TMP_DIR=$(mktemp -d)
trap 'rm -rf "${TMP_DIR}"' EXIT

tar -xzf "${PACKAGE_PATH}" -C "${TMP_DIR}"

if [[ ! -d "${TMP_DIR}/dist" ]]; then
  echo "The artifact does not contain dist/ directory"
  exit 1
fi

aws s3 sync "${TMP_DIR}/dist/" "s3://${FRONTEND_BUCKET}" --delete --region "${AWS_REGION}"
echo "Web client uploaded to s3://${FRONTEND_BUCKET}"

if [[ -n "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]]; then
  aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
    --paths "/*"
  echo "CloudFront invalidation requested for ${CLOUDFRONT_DISTRIBUTION_ID}"
else
  echo "CLOUDFRONT_DISTRIBUTION_ID not set; skipping invalidation."
fi

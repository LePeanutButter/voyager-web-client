#!/usr/bin/env bash
set -euo pipefail

# Manual deploy script for Voyager Web Client
# This script prepares the web client for manual S3 deployment
# VITE variables are already injected during build time by GitHub Actions workflow
#
# Usage:
#   ./scripts/deploy-web-client-manual.sh /path/to/web-client-dist.tar.gz
#
# Optional env vars:
#   FRONTEND_BUCKET= (for documentation purposes)

PACKAGE_PATH="${1:-}"

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

# Create deployment info file
cat > "${TMP_DIR}/dist/deployment-info.txt" << EOF
Deployment Information
====================
Target S3 Bucket: ${FRONTEND_BUCKET:-"not specified"}
Build Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Build Environment: GitHub Actions (VITE variables injected during build)

Manual Deployment Instructions:
1. Upload contents of dist/ directory to your S3 bucket
2. Configure static website hosting on S3 bucket if needed
3. Update CloudFront distribution if applicable

Note: Environment variables are already compiled into the JavaScript files
during the build process. No additional .env configuration is needed.
EOF

# Create deployment package
DEPLOYMENT_PACKAGE="${TMP_DIR}/voyager-web-client-deploy.tar.gz"
tar -czf "${DEPLOYMENT_PACKAGE}" -C "${TMP_DIR}/dist" .

echo "Deployment package created: ${DEPLOYMENT_PACKAGE}"
echo "Package contents:"
tar -tzf "${DEPLOYMENT_PACKAGE}" | head -20
echo "..."
echo ""
echo "Manual deployment required. Upload the contents to S3 bucket: ${FRONTEND_BUCKET:-"not specified"}"
echo "See deployment-info.txt in the package for detailed instructions."

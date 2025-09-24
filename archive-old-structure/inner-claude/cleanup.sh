#!/bin/bash
# Cleanup Script - Remove Overcomplicated CI/CD Files

echo "🧹 Cleaning up overcomplicated CI/CD files..."

# Remove the complex workflows (keep only tests.yml)
rm -f .github/workflows/ci-cd.yml
rm -f .github/workflows/security.yml  
rm -f .github/workflows/simple-ci.yml

# Remove overcomplicated deployment files
rm -f docker-compose.production.yml
rm -f server/Dockerfile
rm -f client/Dockerfile
rm -f client/nginx.conf

# Remove complex environment files
rm -f server/.env.production.example
rm -f client/.env.production.example

# Remove complex documentation
rm -f CICD-README.md

# Keep the scripts directory but remove complex scripts
rm -f scripts/deploy.sh
rm -f scripts/health-check.sh
rm -f scripts/setup-cicd.sh

echo "✅ Cleanup complete!"
echo ""
echo "📋 What's left (what you actually need):"
echo "- .github/workflows/tests.yml (simple CI)"
echo "- LOCAL-CI-SETUP.md (documentation)"
echo "- SIMPLE-DEPLOYMENT.md (future reference)"
echo "- server/routes/health.routes.js (basic health check)"
echo ""
echo "🎯 Your setup is now perfectly sized for a solo developer!"
echo "🚀 Push your next commit to see GitHub Actions in action"

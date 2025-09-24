#!/bin/bash
# Cleanup script for Queen Bee CI/CD artifacts

echo "🧹 Cleaning up CI/CD artifacts..."

# Remove backup workflows
echo "Removing workflow backups..."
rm -rf .github/workflows-backup/
rm -f .github/workflows/test.yml.old

# Remove debugging/temporary files
echo "Removing debug files..."
cd server
rm -f setup-test-db.js
rm -f final-diagnostic.js
rm -f find-failing-tests.sh
rm -f test-analysis.js
rm -f test-results.log
rm -f reduce-test-noise.js
rm -f update-real-data.js

# Remove backup config files
echo "Removing backup configs..."
rm -f .babelrc_backup
rm -f .env.test.disabled
rm -f jest.config.js.disabled

cd ..

echo "✅ Cleanup complete!"
echo ""
echo "Files cleaned up:"
echo "- Workflow backup directory"
echo "- Debug/analysis scripts"
echo "- Backup configuration files"
echo "- Temporary CI files"
echo ""
echo "Your setup is now clean and production-ready! 🚀"
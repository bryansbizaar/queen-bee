#!/bin/bash

echo "🧹 Removing debugging and cleanup files..."

# Remove the debugging/cleanup files we identified
rm -f cleanup-ci-artifacts.sh.deleted
rm -f cleanup.sh
rm -f debug-connection.js
rm -f final-diagnostic.js
rm -f restore-phase1-safely.sh
rm -f test-loading-changes.js.bak
rm -f test-runner.js

echo "✅ Removed debugging files:"
echo "   - cleanup-ci-artifacts.sh"
echo "   - cleanup.sh"
echo "   - debug-connection.js"
echo "   - final-diagnostic.js"
echo "   - restore-phase1-safely.sh"
echo "   - test-loading-changes.js.bak"
echo "   - test-runner.js"

echo ""
echo "✅ Kept: validate-setup.js (useful for development environment validation)"
echo ""
echo "🎯 Your project is now cleaner! All debugging files have been removed."

# Remove this script itself since it's only needed once
rm -f remove-debug-files.sh

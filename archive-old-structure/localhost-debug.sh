#!/bin/bash

echo "=== Localhost Diagnostic Script ==="
echo ""

echo "1. Testing localhost resolution:"
ping -c 1 localhost 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ localhost resolves to an IP"
else
    echo "❌ localhost does not resolve"
fi

echo ""
echo "2. Testing 127.0.0.1 directly:"
ping -c 1 127.0.0.1 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 127.0.0.1 is reachable"
else
    echo "❌ 127.0.0.1 is not reachable"
fi

echo ""
echo "3. Checking hosts file entries:"
echo "Looking for localhost entries in /etc/hosts:"
grep -n "localhost" /etc/hosts 2>/dev/null || echo "No localhost entries found"

echo ""
echo "4. DNS resolution test:"
nslookup localhost 2>/dev/null || echo "nslookup failed for localhost"

echo ""
echo "5. What localhost resolves to:"
echo "localhost resolves to: $(getent hosts localhost 2>/dev/null | awk '{print $1}' || echo 'resolution failed')"

echo ""
echo "=== Diagnostic Complete ==="
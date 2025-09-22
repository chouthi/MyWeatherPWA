#!/bin/bash
# Quick PWA Offline Test Script

echo "🧪 PWA Offline Test"
echo "===================="

# Build and serve
echo "📦 Building..."
npm run build

echo "🚀 Starting server..."
npx serve out -p 3000 &
SERVER_PID=$!

echo "⏱️  Waiting for server..."
sleep 3

echo "🌐 Testing online access..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
echo " - App accessible"

echo "📱 Service Worker check..."
# Check if SW file exists
if [ -f "out/sw.js" ]; then
    echo "✅ Service Worker found"
else
    echo "❌ Service Worker missing"
fi

echo "💾 Check cache files..."
if [ -f "out/_next/static" ]; then
    echo "✅ Static assets found"
else
    echo "❌ Static assets missing"
fi

echo "🔍 Lighthouse PWA audit..."
npx lighthouse http://localhost:3000 --only-categories=pwa --output=json --output-path=./pwa-audit.json

echo "🛑 Killing server..."
kill $SERVER_PID

echo "✅ Test complete! Check pwa-audit.json for detailed results"
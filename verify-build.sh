#!/bin/bash

echo "🔍 Verifying Netlify deployment configuration..."

# Check if out directory exists
if [ -d "out" ]; then
    echo "✅ Build output directory 'out' exists"
    
    # Check if index.html exists
    if [ -f "out/index.html" ]; then
        echo "✅ index.html exists in build output"
    else
        echo "❌ index.html missing from build output"
        exit 1
    fi
    
    # Check if _redirects exists
    if [ -f "out/_redirects" ]; then
        echo "✅ _redirects file exists in build output"
        echo "📄 _redirects content:"
        cat out/_redirects
    else
        echo "❌ _redirects file missing from build output"
        exit 1
    fi
    
    # List main directories
    echo "📁 Main directories in build output:"
    ls -la out/ | grep "^d"
    
    echo "🎉 Build verification completed successfully!"
else
    echo "❌ Build output directory 'out' does not exist"
    echo "💡 Run 'npm run build' to generate the build output"
    exit 1
fi

#!/bin/bash

# WordChain App - GitHub Push Script
# Run this after creating an empty repo at: https://github.com/mntrushmore/wordchain-app

echo "🚀 Pushing WordChain App to GitHub..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory. Please cd to /home/user/workspace first"
    exit 1
fi

# Add GitHub remote if it doesn't exist
if ! git remote | grep -q "github"; then
    echo "📝 Adding GitHub remote..."
    git remote add github https://github.com/mntrushmore/wordchain-app.git
else
    echo "✅ GitHub remote already exists"
fi

# Show current remotes
echo ""
echo "📍 Current git remotes:"
git remote -v
echo ""

# Push to GitHub
echo "⬆️  Pushing to GitHub (main branch)..."
git push -u github main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your repository is now live at:"
    echo "   https://github.com/mntrushmore/wordchain-app"
    echo ""
    echo "📱 Next steps:"
    echo "   1. Visit the repository URL above"
    echo "   2. Add a description and topics"
    echo "   3. Share with your team!"
else
    echo ""
    echo "❌ Push failed. This might be because:"
    echo "   1. Repository doesn't exist yet - create it at https://github.com/new"
    echo "   2. Authentication needed - you may need a Personal Access Token"
    echo ""
    echo "To create a Personal Access Token:"
    echo "   1. Go to: https://github.com/settings/tokens"
    echo "   2. Generate new token (classic)"
    echo "   3. Select 'repo' scope"
    echo "   4. Use token as password when prompted"
    echo ""
fi

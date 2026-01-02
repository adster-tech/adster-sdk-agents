#!/bin/bash

# Adster MCP Server Installation Script
# This script installs the Adster MCP server for Claude Code integration

set -e

echo "🚀 Installing Adster MCP Server for Claude Code..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the project
echo ""
echo "🔨 Building MCP server..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Add this MCP server to your Claude Code configuration:"
echo ""
echo "   Open your Claude Code settings and add:"
echo ""
echo "   \"mcpServers\": {"
echo "     \"adster-android-integrator\": {"
echo "       \"command\": \"node\","
echo "       \"args\": [\"$(pwd)/dist/index.js\"]"
echo "     }"
echo "   }"
echo ""
echo "2. Restart Claude Code"
echo ""
echo "3. Use the agent with:"
echo "   @agent-adster-android-integrator integrate Adster SDK into my Android project"
echo ""
echo "🎉 Installation complete!"

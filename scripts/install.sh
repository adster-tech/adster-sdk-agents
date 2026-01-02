#!/bin/bash

# Adster SDK Agents Installer
# Installs Claude Code agents for Adster Android SDK integration

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository configuration
REPO_OWNER="adstertech"
REPO_NAME="adster-sdk-agents"
BRANCH="main"
BASE_URL="https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}"

# Default configuration
INSTALL_SCOPE="global"
PLATFORM="android"
NON_INTERACTIVE=false

# Detect CI environment
if [ -n "$CI" ] || [ -n "$GITHUB_ACTIONS" ] || [ -n "$GITLAB_CI" ] || [ -n "$CIRCLECI" ]; then
    NON_INTERACTIVE=true
fi

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --global)
            INSTALL_SCOPE="global"
            shift
            ;;
        --local)
            INSTALL_SCOPE="local"
            shift
            ;;
        --platform=*)
            PLATFORM="${1#*=}"
            shift
            ;;
        --branch=*)
            BRANCH="${1#*=}"
            BASE_URL="https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}"
            shift
            ;;
        --non-interactive)
            NON_INTERACTIVE=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--global|--local] [--platform=android|all] [--branch=main] [--non-interactive]"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Adster SDK Agents Installer for Claude Code${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
echo ""

# Check for curl
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is not installed${NC}"
    echo "Please install curl and try again"
    exit 1
fi
echo -e "${GREEN}✓${NC} curl is available"

# Check for Claude Code
CLAUDE_INSTALLED=false
if command -v claude &> /dev/null; then
    CLAUDE_INSTALLED=true
    echo -e "${GREEN}✓${NC} Claude Code CLI is installed"
elif [ -d "$HOME/.claude" ]; then
    CLAUDE_INSTALLED=true
    echo -e "${GREEN}✓${NC} Claude Code directory found"
else
    echo -e "${YELLOW}⚠${NC}  Claude Code not detected (optional)"
    echo "   Install from: https://claude.com/claude-code"
fi

echo ""

# Determine installation directory
if [ "$INSTALL_SCOPE" = "global" ]; then
    INSTALL_DIR="$HOME/.claude/agents"
    echo -e "${BLUE}Installation scope:${NC} Global (${INSTALL_DIR})"
else
    INSTALL_DIR=".claude/agents"
    echo -e "${BLUE}Installation scope:${NC} Local project (${INSTALL_DIR})"
fi

echo -e "${BLUE}Platform:${NC} ${PLATFORM}"
echo ""

# Define agents based on platform
declare -a AGENTS

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
    AGENTS+=(
        "android/adster-custom-adapter-integrator.md"
        "android/adster-android-integrator.md"
    )
fi

if [ ${#AGENTS[@]} -eq 0 ]; then
    echo -e "${RED}❌ No agents selected for installation${NC}"
    echo "Valid platforms: android, all"
    exit 1
fi

# Create installation directory
mkdir -p "${INSTALL_DIR}/android"

# Download and install agents
echo -e "${YELLOW}Installing agents...${NC}"
echo ""

INSTALLED_COUNT=0
FAILED_COUNT=0

for agent in "${AGENTS[@]}"; do
    agent_name=$(basename "$agent")
    platform_dir=$(dirname "$agent")
    url="${BASE_URL}/.claude/agents/${agent}"
    dest="${INSTALL_DIR}/${agent}"

    echo -n "  Installing ${agent_name}... "

    if curl -fsSL "$url" -o "$dest" 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        ((INSTALLED_COUNT++))
    else
        echo -e "${RED}✗${NC}"
        ((FAILED_COUNT++))
    fi
done

echo ""

# Installation summary
if [ $FAILED_COUNT -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   ✓ Installation Complete!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}   ⚠ Installation completed with warnings${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

echo ""
echo -e "${BLUE}Installed agents:${NC} ${INSTALLED_COUNT}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${RED}Failed:${NC} ${FAILED_COUNT}"
fi
echo ""

# Show installed agents
echo -e "${YELLOW}Available Agents:${NC}"
echo ""
echo -e "  ${GREEN}@adster-custom-adapter-integrator${NC}"
echo -e "    Integrate Adster as a mediation partner"
echo -e "    Works with: GAM, AdMob, AppLovin MAX, IronSource"
echo ""
echo -e "  ${GREEN}@adster-android-integrator${NC}"
echo -e "    Direct SDK integration (legacy)"
echo -e "    Full control with all ad formats"
echo ""

# Next steps
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Next Steps${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Navigate to your Android project directory:"
echo -e "   ${YELLOW}cd /path/to/your/android/project${NC}"
echo ""
echo "2. Launch Claude Code:"
echo -e "   ${YELLOW}claude${NC}"
echo ""
echo "3. Use an agent (Custom Adapter recommended):"
echo -e "   ${YELLOW}Use @adster-custom-adapter-integrator to integrate Adster for AdMob${NC}"
echo ""
echo "   Or for legacy direct SDK integration:"
echo -e "   ${YELLOW}Use @adster-android-integrator to integrate Adster SDK${NC}"
echo ""

if [ "$INSTALL_SCOPE" = "local" ]; then
    echo -e "${BLUE}Note:${NC} Agents installed locally in this project only"
    echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Resources${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  📚 Documentation: ${YELLOW}https://ca-docs.adster.tech/${NC}"
echo -e "  🎛  Dashboard:     ${YELLOW}https://dashboard.adster.tech/${NC}"
echo -e "  💬 Support:       ${YELLOW}support@adster.tech${NC}"
echo -e "  🐙 GitHub:        ${YELLOW}https://github.com/${REPO_OWNER}/${REPO_NAME}${NC}"
echo ""

exit 0

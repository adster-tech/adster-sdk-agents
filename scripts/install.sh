#!/bin/bash

# Adster SDK Agents Installer
# Installs Claude Code and Codex CLI agents for Adster Android SDK integration

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository configuration
REPO_OWNER="adster-tech"
REPO_NAME="adster-sdk-agents"
BRANCH="main"
BASE_URL="https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}"

# Default configuration
INSTALL_SCOPE="global"
PLATFORM="android"
TARGET_CLIENT="claude"
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
        --source=*)
            INSTALL_SOURCE="${1#*=}"
            shift
            ;;
        --client=*)
            TARGET_CLIENT="${1#*=}"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--global|--local] [--source=remote|local] [--platform=android|all] [--branch=main] [--client=claude|codex|both]"
            exit 1
            ;;
    esac
done

# Default to remote if not specified
INSTALL_SOURCE=${INSTALL_SOURCE:-remote}

declare -a TARGET_CLIENTS
case "$TARGET_CLIENT" in
    claude)
        TARGET_CLIENTS=("claude")
        ;;
    codex)
        TARGET_CLIENTS=("codex")
        ;;
    both)
        TARGET_CLIENTS=("claude" "codex")
        ;;
    *)
        echo -e "${RED}Invalid client specified: ${TARGET_CLIENT}${NC}"
        echo "Valid values for --client: claude, codex, both"
        exit 1
        ;;
esac

INSTALL_CLAUDE=false
INSTALL_CODEX=false
for client in "${TARGET_CLIENTS[@]}"; do
    if [ "$client" = "claude" ]; then
        INSTALL_CLAUDE=true
    elif [ "$client" = "codex" ]; then
        INSTALL_CODEX=true
    fi
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Adster SDK Agents Installer for Claude Code & Codex${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
echo ""

# Check for curl (only if remote)
if [ "$INSTALL_SOURCE" = "remote" ]; then
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is not installed${NC}"
        echo "Please install curl and try again"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} curl is available"
fi

if $INSTALL_CLAUDE; then
    if command -v claude &> /dev/null; then
        echo -e "${GREEN}✓${NC} Claude Code CLI is installed"
    elif [ -d "$HOME/.claude" ]; then
        echo -e "${GREEN}✓${NC} Claude Code directory found"
    else
        echo -e "${YELLOW}⚠${NC}  Claude Code not detected (optional)"
        echo "   Install from: https://claude.com/claude-code"
    fi
fi

if $INSTALL_CODEX; then
    if command -v codex &> /dev/null; then
        echo -e "${GREEN}✓${NC} Codex CLI is installed"
    elif [ -d "$HOME/.codex" ]; then
        echo -e "${GREEN}✓${NC} Codex configuration directory found"
    else
        echo -e "${YELLOW}⚠${NC}  Codex CLI not detected (optional)"
        echo "   Install from: https://github.com/openai/codex"
    fi
fi

echo ""

# Determine installation directory per client
declare -A INSTALL_DIRS
declare -A CLIENT_LABELS=(["claude"]="Claude Code" ["codex"]="Codex CLI")

if [ "$INSTALL_SCOPE" = "global" ]; then
    INSTALL_DIRS["claude"]="$HOME/.claude/agents"
    INSTALL_DIRS["codex"]="$HOME/.codex/agents"
    echo -e "${BLUE}Installation scope:${NC} Global"
else
    INSTALL_DIRS["claude"]=".claude/agents"
    INSTALL_DIRS["codex"]=".codex/agents"
    echo -e "${BLUE}Installation scope:${NC} Local project"
fi

for client in "${TARGET_CLIENTS[@]}"; do
    dir="${INSTALL_DIRS[$client]}"
    echo -e "  - ${CLIENT_LABELS[$client]} → ${dir}"
done

echo -e "${BLUE}Install source:${NC}     ${INSTALL_SOURCE}"
echo -e "${BLUE}Platform:${NC}           ${PLATFORM}"
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

# Create installation directories
for client in "${TARGET_CLIENTS[@]}"; do
    mkdir -p "${INSTALL_DIRS[$client]}/android"
done

# Download and install agents
echo -e "${YELLOW}Installing agents...${NC}"
echo ""

declare -A INSTALLED_COUNT
declare -A FAILED_COUNT
for client in "${TARGET_CLIENTS[@]}"; do
    INSTALLED_COUNT[$client]=0
    FAILED_COUNT[$client]=0
done

REPO_ROOT=$(pwd)

for client in "${TARGET_CLIENTS[@]}"; do
    install_dir="${INSTALL_DIRS[$client]}"
    client_label="${CLIENT_LABELS[$client]}"
    local_base="${REPO_ROOT}/.${client}/agents"
    remote_base="${BASE_URL}/.${client}/agents"

    echo -e "${BLUE}${client_label}:${NC} Installing to ${install_dir}"

    for agent in "${AGENTS[@]}"; do
        agent_name=$(basename "$agent")
        dest="${install_dir}/${agent}"
        mkdir -p "$(dirname "$dest")"

        echo -n "  Installing ${agent_name}... "

        if [ "$INSTALL_SOURCE" = "local" ]; then
            local_src="${local_base}/${agent}"
            if [ -f "$local_src" ]; then
                cp "$local_src" "$dest"
                echo -e "${GREEN}✓ (local)${NC}"
                INSTALLED_COUNT[$client]=$(( ${INSTALLED_COUNT[$client]} + 1 ))
            else
                echo -e "${RED}✗ (file not found: $local_src)${NC}"
                FAILED_COUNT[$client]=$(( ${FAILED_COUNT[$client]} + 1 ))
            fi
        else
            url="${remote_base}/${agent}"
            if curl -fsSL "$url" -o "$dest" 2>/dev/null; then
                echo -e "${GREEN}✓${NC}"
                INSTALLED_COUNT[$client]=$(( ${INSTALLED_COUNT[$client]} + 1 ))
            else
                echo -e "${RED}✗ (download failed)${NC}"
                FAILED_COUNT[$client]=$(( ${FAILED_COUNT[$client]} + 1 ))
            fi
        fi
    done
    echo ""
done

# Installation summary
total_failed=0
for client in "${TARGET_CLIENTS[@]}"; do
    total_failed=$(( total_failed + ${FAILED_COUNT[$client]} ))
done

if [ $total_failed -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   ✓ Installation Complete!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}   ⚠ Installation completed with warnings${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

echo ""
for client in "${TARGET_CLIENTS[@]}"; do
    echo -e "${BLUE}${CLIENT_LABELS[$client]}:${NC} Installed ${INSTALLED_COUNT[$client]}, Failed ${FAILED_COUNT[$client]}"
done
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

if $INSTALL_CLAUDE; then
    echo -e "${BLUE}Claude Code:${NC}"
    echo "2. Launch Claude Code:"
    echo -e "   ${YELLOW}claude${NC}"
    echo ""
    echo "3. Use an agent (Custom Adapter recommended):"
    echo -e "   ${YELLOW}Use @adster-custom-adapter-integrator to integrate Adster for AdMob${NC}"
    echo ""
    echo "   Or for legacy direct SDK integration:"
    echo -e "   ${YELLOW}Use @adster-android-integrator to integrate Adster SDK${NC}"
    echo ""
fi

if $INSTALL_CODEX; then
    echo -e "${BLUE}Codex CLI:${NC}"
    echo "2. Launch Codex:"
    echo -e "   ${YELLOW}codex${NC}"
    echo ""
    echo "3. Use the same agent commands:"
    echo -e "   ${YELLOW}Use @adster-custom-adapter-integrator to integrate Adster for AdMob${NC}"
    echo -e "   ${YELLOW}Use @adster-android-integrator to integrate Adster SDK${NC}"
    echo ""
fi

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

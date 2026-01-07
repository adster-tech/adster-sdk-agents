# Adster SDK Agents for Claude Code & Codex

AI-powered Android SDK integration agents for Claude Code and Codex CLI. Integrate Adster Custom Adapter or Adster Orchestration SDK into your Android apps in minutes.

## Quick Start

Install Adster agents with one command:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/adster-tech/adster-sdk-agents/main/scripts/install.sh)
```

Add `--client=codex` to install Codex CLI agents or `--client=both` for both IDEs.

Then in your Android project (inside Claude Code or Codex CLI):

```
Use @adster-custom-adapter-integrator to integrate Adster for AdMob
```

## Overview

This repository provides Claude Code and Codex CLI agents that automate Adster SDK integration into Android applications. Choose between:

1. **Custom Adapter** (Recommended): Integrate Adster as a mediation partner with GAM, AdMob, AppLovin MAX, or IronSource LevelPlay
2. **Direct SDK** (Legacy): Full control with direct Adster Orchestration SDK integration

## Features

### Available Agents

- 🤖 **@adster-custom-adapter-integrator**: Integrates Adster Custom Adapter for mediation setups
  - Automatically updates build.gradle, AndroidManifest.xml, and ProGuard rules
  - Supports GAM, AdMob, AppLovin MAX, and IronSource LevelPlay
  - Provides dashboard configuration instructions
  - No code changes required - works with existing mediation code

- 🔧 **@adster-android-integrator**: Legacy direct SDK integration
  - Full Adster Orchestration SDK integration
  - All ad formats: banner, interstitial, rewarded, native
  - Complete code examples and implementation guides
  - Best for apps not using mediation platforms

## Prerequisites

- Claude Code installed ([Download here](https://claude.com/claude-code))
- Codex CLI installed (optional, install from [github.com/openai/codex](https://github.com/openai/codex))
- Android development environment
- curl (for installation)

## Installation

### Option 1: One-Line Install (Recommended)

Install agents globally for all your projects (use `--client=codex` or `--client=both` for Codex support):

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/adster-tech/adster-sdk-agents/main/scripts/install.sh)
```

### Option 2: Local Project Install

Install agents only for the current project (add `--client=codex` or `--client=both` if needed):

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/adster-tech/adster-sdk-agents/main/scripts/install.sh) --local
```

### Option 3: Manual Install

Clone and explore the repository:

```bash
git clone https://github.com/adster-tech/adster-sdk-agents.git
cd adster-sdk-agents

# Copy agents to Claude Code directory
cp -r .claude/agents/android ~/.claude/agents/

# Copy agents to Codex CLI directory (optional)
cp -r .codex/agents/android ~/.codex/agents/
```

## Usage

After installation, navigate to your Android project and use the agents inside Claude Code or Codex CLI.

### Codex CLI Usage

1. Install the agents with `--client=codex` (or `--client=both` if you also use Claude Code).
2. Run `codex` from your Android project directory.
3. Use the same prompts as Claude Code, for example:
   ```
   Use @adster-custom-adapter-integrator to integrate Adster for AdMob
   ```

### Custom Adapter Integration (Recommended)

For apps using mediation platforms (GAM, AdMob, AppLovin, IronSource):

```
Use @adster-custom-adapter-integrator to integrate Adster for AdMob
```

Or specify your ad network:

```
Use @adster-custom-adapter-integrator to integrate Adster for Google Ad Manager
Use @adster-custom-adapter-integrator to integrate Adster for AppLovin MAX
Use @adster-custom-adapter-integrator to integrate Adster for IronSource LevelPlay
```

The agent will:
- ✅ Add the appropriate Custom Adapter dependency to build.gradle
- ✅ Add required permissions to AndroidManifest.xml
- ✅ Configure ProGuard rules
- ✅ Provide detailed dashboard configuration instructions

### Direct SDK Integration (Legacy)

For apps wanting full SDK control without mediation:

```
Use @adster-android-integrator to integrate Adster SDK
```

The agent will:
- ✅ Add Adster Orchestration SDK dependency
- ✅ Configure AndroidManifest.xml with permissions and API key
- ✅ Set up ProGuard rules
- ✅ Create Application class with SDK initialization
- ✅ Provide complete implementation examples for all ad formats

## What Gets Integrated

### Custom Adapter Integration

The Custom Adapter agent automatically:

1. **Updates `build.gradle`**:
   - For GAM/AdMob: `implementation 'com.adstertech:customadapter-lite:2.2.1'`
   - For AppLovin: `implementation 'com.adstertech:customadapter-applovin:2.1.4'`
   - For IronSource: `implementation 'com.adstertech:customadapter-ironsource:2.1.4'`

2. **Updates `AndroidManifest.xml`**:
   - Adds `INTERNET` permission
   - Adds `ACCESS_NETWORK_STATE` permission

3. **Updates `proguard-rules.pro`**:
   - Adds ProGuard rules to keep Adster classes

4. **Provides Dashboard Configuration Instructions**:
   - Step-by-step guide for your chosen mediation platform
   - Custom event class names for each ad format
   - Links to detailed documentation

### Direct SDK Integration

The Direct SDK agent automatically:

1. **Updates `build.gradle`**:
   - Adds `implementation 'com.adstertech:orchestration-sdk:+'`
   - Adds required AndroidX dependencies

2. **Updates `AndroidManifest.xml`**:
   - Adds required permissions
   - Adds API key configuration placeholder
   - Sets `usesCleartextTraffic` attribute

3. **Updates `proguard-rules.pro`**:
   - Adds comprehensive ProGuard rules for SDK classes

4. **Creates/Updates Application Class**:
   - SDK initialization code
   - Test mode configuration

5. **Provides Implementation Examples**:
   - Banner, Interstitial, Rewarded, and Native ad examples
   - Complete code snippets in Kotlin and Java
   - Lifecycle management and best practices

## Example Workflow

1. **Install agents** (one time):
   ```bash
   bash <(curl -fsSL https://raw.githubusercontent.com/adster-tech/adster-sdk-agents/main/scripts/install.sh)
   ```

2. **Navigate to your Android project**:
   ```bash
   cd /path/to/your/android/project
   ```

3. **Launch Claude Code or Codex CLI**:
   ```bash
   claude   # Claude Code
   codex    # Codex CLI
   ```

4. **Use the agent**:
   ```
   Use @adster-custom-adapter-integrator to integrate Adster for AdMob
   ```

5. **Sync Gradle files** and configure Adster in your mediation dashboard

6. **Ads will serve** through your existing mediation code!

## Why Use Adster Agents?

### Custom Adapter Benefits

✅ **No Code Changes**: Use your ad network's standard APIs
✅ **Seamless Integration**: Works with existing mediation setup
✅ **Dashboard Configured**: Set up in your mediation platform
✅ **Automatic Serving**: Adster participates in mediation automatically
✅ **AI-Powered**: Claude Code or Codex CLI handles the integration complexity
✅ **Multi-Network Support**: Works with GAM, AdMob, AppLovin, IronSource

### Direct SDK Benefits

✅ **Full Control**: Complete access to all SDK features
✅ **All Ad Formats**: Banner, interstitial, rewarded, native
✅ **Code Examples**: Ready-to-use implementation snippets
✅ **Best Practices**: Built-in guidance for optimal integration
✅ **AI-Assisted**: Claude Code or Codex CLI writes and explains the code

## Troubleshooting

### Agents Not Found

If Claude Code doesn't recognize the agents:

1. **Verify installation**:
   ```bash
   ls -la ~/.claude/agents/android/   # Claude Code
   ls -la ~/.codex/agents/android/    # Codex CLI
   ```
   You should see `adster-custom-adapter-integrator.md` and `adster-android-integrator.md`

2. **Reinstall agents**:
   ```bash
   bash <(curl -fsSL https://raw.githubusercontent.com/adster-tech/adster-sdk-agents/main/scripts/install.sh)
   ```

3. **Restart Claude Code or start a fresh Codex CLI session**

### Agent Integration Issues

If the agent fails to integrate:

1. **Check project structure**: Ensure you're in an Android project directory with `app/build.gradle`
2. **Check permissions**: Ensure you have write access to project files
3. **Review error messages**: The agent will explain what went wrong
4. **Try again**: Ask Claude to retry with more specific instructions

### Installation Script Fails

If the installation script fails:

1. **Check curl**: Ensure curl is installed (`curl --version`)
2. **Check network**: Verify you can access GitHub
3. **Manual install**: Clone the repo and copy agents manually
4. **Check permissions**: Ensure you have write access to `~/.claude/agents/` and `~/.codex/agents/`

## Documentation & Resources

- **Custom Adapter Documentation**: https://ca-docs.adster.tech/
- **Adster Dashboard**: https://dashboard.adster.tech/ (Get your API keys and Zone IDs)
- **Claude Code**: https://claude.com/claude-code
- **Codex CLI**: https://github.com/openai/codex
- **Support Email**: support@adster.tech

## Repository Structure

```
adster-sdk-agents/
├── .claude/
│   └── agents/
│       └── android/
│           ├── adster-custom-adapter-integrator.md
│           └── adster-android-integrator.md
├── .codex/
│   └── agents/
│       └── android/
│           ├── adster-custom-adapter-integrator.md
│           └── adster-android-integrator.md
├── scripts/
│   └── install.sh
├── README.md
└── LICENSE
```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes to the agent files
4. Test the agents with Claude Code or Codex CLI
5. Submit a Pull Request

### Testing Agents Locally

To test agent changes before submitting:

```bash
# Copy agents to your local Claude Code directory
cp .claude/agents/android/*.md ~/.claude/agents/android/

# Copy agents to your local Codex CLI directory (optional)
cp .codex/agents/android/*.md ~/.codex/agents/android/

# Use them in your IDE of choice
claude
codex
```

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- **Issues**: https://github.com/adster-tech/adster-sdk-agents/issues
- **Email**: support@adster.tech
- **Documentation**: https://ca-docs.adster.tech/

## About Claude Code & Codex

Claude Code is an AI-powered development assistant by Anthropic that helps you write, understand, and improve code. Learn more at https://claude.com/claude-code

Codex CLI is OpenAI's command-line coding environment powered by GPT-5 Codex, providing the same MCP and agent integrations directly from your terminal. Learn more at https://github.com/openai/codex

---

**Made with ❤️ by Adster** | Powering mobile advertising worldwide

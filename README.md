# Adster SDK Agents for Claude Code

AI-powered Android SDK integration agents for Claude Code. Integrate Adster Custom Adapter or Adster Orchestration SDK into your Android apps in minutes.

## Quick Start

Install Adster agents with one command:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/adster-tech/adster-sdk-agents/main/scripts/install.sh)
```

Then in your Android project:

```
Use @adster-custom-adapter-integrator to integrate Adster for AdMob
```

## Overview

This repository provides Claude Code agents that automate Adster SDK integration into Android applications. Choose between:

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
- Android development environment
- curl (for installation)

## Installation

### Option 1: One-Line Install (Recommended)

Install agents globally for all your projects:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/adster-tech/adster-sdk-agents/main/scripts/install.sh)
```

### Option 2: Local Project Install

Install agents only for the current project:

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
```

## Usage

After installation, navigate to your Android project and use the agents with Claude Code.

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

3. **Launch Claude Code**:
   ```bash
   claude
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
✅ **AI-Powered**: Claude handles the integration complexity
✅ **Multi-Network Support**: Works with GAM, AdMob, AppLovin, IronSource

### Direct SDK Benefits

✅ **Full Control**: Complete access to all SDK features
✅ **All Ad Formats**: Banner, interstitial, rewarded, native
✅ **Code Examples**: Ready-to-use implementation snippets
✅ **Best Practices**: Built-in guidance for optimal integration
✅ **AI-Assisted**: Claude writes and explains the code

## Troubleshooting

### Agents Not Found

If Claude Code doesn't recognize the agents:

1. **Verify installation**:
   ```bash
   ls -la ~/.claude/agents/android/
   ```
   You should see `adster-custom-adapter-integrator.md` and `adster-android-integrator.md`

2. **Reinstall agents**:
   ```bash
   bash <(curl -fsSL https://raw.githubusercontent.com/adster-tech/adster-sdk-agents/main/scripts/install.sh)
   ```

3. **Restart Claude Code**

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
4. **Check permissions**: Ensure you have write access to `~/.claude/agents/`

## Documentation & Resources

- **Custom Adapter Documentation**: https://ca-docs.adster.tech/
- **Adster Dashboard**: https://dashboard.adster.tech/ (Get your API keys and Zone IDs)
- **Claude Code**: https://claude.com/claude-code
- **Support Email**: support@adster.tech

## Repository Structure

```
adster-sdk-agents/
├── .claude/
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
4. Test the agents with Claude Code
5. Submit a Pull Request

### Testing Agents Locally

To test agent changes before submitting:

```bash
# Copy agents to your local Claude directory
cp .claude/agents/android/*.md ~/.claude/agents/android/

# Use them in Claude Code
claude
```

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- **Issues**: https://github.com/adster-tech/adster-sdk-agents/issues
- **Email**: support@adster.tech
- **Documentation**: https://ca-docs.adster.tech/

## About Claude Code

Claude Code is an AI-powered development assistant by Anthropic that helps you write, understand, and improve code. Learn more at https://claude.com/claude-code

---

**Made with ❤️ by Adster** | Powering mobile advertising worldwide

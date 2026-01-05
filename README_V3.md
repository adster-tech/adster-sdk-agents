# Adster SDK Agents for Claude Code - v3.0.0

🚀 **Major Update**: Completely rewritten with robust parsing, conflict detection, rollback support, and comprehensive testing!

AI-powered Android SDK integration agents for Claude Code. Integrate Adster Custom Adapter or Adster Orchestration SDK into your Android apps with enterprise-grade reliability.

## What's New in v3.0.0

### 🎯 Core Improvements
- ✅ **settings.gradle Support**: Automatic repository configuration for modern Android projects
- ✅ **Conflict Detection**: identifies version conflicts, duplicate dependencies, and incompatibilities
- ✅ **Rollback Mechanism**: Automatic backups with easy rollback on failure
- ✅ **Smart Version Management**: Validates SDK versions against Maven Central
- ✅ **Proper File Parsing**: Uses XML and Gradle parsers instead of fragile regex
- ✅ **Progress Tracking**: Real-time progress updates with emoji indicators
- ✅ **Better Error Recovery**: Actionable error messages with suggested fixes

### 🛠️ New Tools
- `update_adster_version`: Update to latest or specific SDK versions
- `analyze_dependencies`: Comprehensive dependency conflict analysis  
- `rollback_integration`: Restore previous state from backups

### 📊 Quality & Testing
- ✅ **Comprehensive Test Suite**: 30+ unit tests with Jest
- ✅ **Type Safety**: Full TypeScript types throughout
- ✅ **Better Logging**: Structured logging with emoji indicators
- ✅ **Validation Improvements**: Deep validation of integration quality

### 🔧 API Changes
- ❌ Removed `ADSTER_API_KEY` concept (not needed for any integration)
- ✅ Added placement ID support for Orchestration SDK
- ✅ Simplified dashboard configuration (Placement IDs everywhere)

## Quick Start

### One-Line Install

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/adster-tech/adster-sdk-agents/main/scripts/install.sh)
```

Then in your Android project:

```
Use @adster-custom-adapter-integrator to integrate Adster for AdMob
```

## Features

### Custom Adapter Integration (Recommended)

Integrate Adster as a mediation partner with:
- **Google Ad Manager (GAM)**
- **AdMob**
- **AppLovin MAX**
- **IronSource LevelPlay**

**Benefits:**
- ✅ No code changes required
- ✅ Uses standard mediation APIs
- ✅ Dashboard-configured
- ✅ Automatic conflict detection
- ✅ Rollback support

### Orchestration SDK Integration (Legacy)

Direct SDK integration for full control:
- ✅ All ad formats: banner, interstitial, rewarded, native
- ✅ Placement ID configuration
- ✅ Complete code examples
- ✅ Best for non-mediation apps

## Tools Available

### `integrate_adster_custom_adapter`
Integrates Custom Adapter with comprehensive validation and rollback.

**Parameters:**
- `projectPath` (required): Android project root
- `adNetwork` (required): `gam`, `admob`, `applovin`, or `ironsource`
- `sdkVersion` (optional): Specific version (auto-validates)

**Features:**
- ✅ Validates project structure
- ✅ Checks dependency conflicts
- ✅ Creates automatic backups
- ✅ Updates settings.gradle, build.gradle, manifest, ProGuard
- ✅ Verifies integration quality
- ✅ Provides dashboard configuration instructions

### `integrate_adster_orchestration_sdk`
Direct SDK integration for non-mediation setups.

**Parameters:**
- `projectPath` (required): Android project root
- `sdkVersion` (optional): SDK version (defaults to latest)

### `validate_adster_integration`
Comprehensive integration validation with scoring.

**Checks:**
- ✅ SDK dependencies present and correct
- ✅ Required permissions configured
- ✅ ProGuard rules properly set
- ✅ Version compatibility
- ✅ Conflict detection

### `analyze_dependencies`
Analyzes all dependencies for conflicts and issues.

**Detects:**
- Version conflicts (same dependency, different versions)
- Duplicate Adster adapters
- Incompatible SDK combinations
- Outdated versions
- Missing mediation SDKs

### `update_adster_version`
Updates Adster SDK to latest or specific version.

**Parameters:**
- `projectPath` (required)
- `targetVersion` (optional): Leave empty for latest

### `rollback_integration`
Restores project to a previous backup.

**Parameters:**
- `projectPath` (required)
- `backupId` (optional): Leave empty to list available backups

## Example Workflow

```bash
# 1. Install agents (one-time)
bash <(curl -fsSL https://raw.githubusercontent.com/adster-tech/adster-sdk-agents/main/scripts/install.sh)

# 2. Navigate to your Android project
cd ~/AndroidStudioProjects/MyApp

# 3. Launch Claude Code
claude

# 4. Integrate Adster
> Integrate Adster Custom Adapter for AdMob

# 5. Validate integration
> Validate my Adster integration

# 6. Analyze dependencies
> Analyze my project dependencies for conflicts

# 7. If needed, rollback
> Rollback to previous backup
```

## What Gets Modified

### Custom Adapter Integration

1. **`settings.gradle`** or **`settings.gradle.kts`**:
   - Adds `mavenCentral()` repository

2. **`app/build.gradle`** or **`app/build.gradle.kts`**:
   - For GAM/AdMob: `com.adstertech:customadapter-lite:2.2.1`
   - For AppLovin: `com.adstertech:customadapter-applovin:2.1.4`
   - For IronSource: `com.adstertech:customadapter-ironsource:2.1.4`

3. **`AndroidManifest.xml`**:
   - `<uses-permission android:name="android.permission.INTERNET" />`
   - `<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`

4. **`proguard-rules.pro`**:
   ```proguard
   -keep class com.adstertech.** { *; }
   -keep interface com.adstertech.** { *; }
   -dontwarn com.adstertech.**
   ```

5. **`.adster-backup/`**:
   - Automatic backups of all modified files

## Dashboard Configuration

After integration, configure Adster in your mediation dashboard:

### Google Ad Manager
```
Class Names:
• Banner: com.adstertech.customadapter.AdsterCustomEventBanner
• Interstitial: com.adstertech.customadapter.AdsterCustomEventInterstitial
• Rewarded: com.adstertech.customadapter.AdsterCustomEventRewarded
• Native: com.adstertech.customadapter.AdsterCustomEventNative
```

### AdMob
```
Custom Event Classes (same as GAM)
```

### AppLovin MAX
```
Adapter Class: com.adstertech.customadapter.applovin.AdsterMediationAdapter
```

### IronSource LevelPlay
```
Custom Adapter Classes:
• Banner: com.adstertech.customadapter.ironsource.AdsterCustomBanner
• Interstitial: com.adstertech.customadapter.ironsource.AdsterCustomInterstitial
• Rewarded: com.adstertech.customadapter.ironsource.AdsterCustomRewardedVideo
```

## Advanced Features

### Automatic Backups

Every integration creates a timestamped backup:
```
.adster-backup/
  backup-1704441600000/
    build.gradle
    AndroidManifest.xml
    ...
```

### Conflict Detection

Automatically detects and reports:
```
❌ Multiple versions of androidx.appcompat found: 1.6.0, 1.6.1
💡 Resolution: Keep only one version, preferably the latest: 1.6.1

❌ Both Adster Orchestration SDK and Custom Adapter detected
💡 Resolution: For mediation setups, use only Custom Adapter
```

### Version Validation

```bash
> Integrate Adster Custom Adapter for AdMob with version 3.0.0

⚠️ Version 3.0.0 not found on Maven Central
✅ Using default version: 2.2.1 instead
```

### Progress Tracking

```
🚀 [1/9] Validating project structure
✅ Completed: Validating project structure

🚀 [2/9] Validating SDK version
✅ Completed: Validating SDK version

🚀 [3/9] Checking for dependency conflicts
✅ Completed: Checking for dependency conflicts
...
```

## Development

### Build from Source

```bash
git clone https://github.com/adster-tech/adster-sdk-agents.git
cd adster-sdk-agents
npm install
npm run build
```

### Run Tests

```bash
npm test
npm run test:watch  # Watch mode
```

### Project Structure

```
adster-sdk-agents/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── types.ts              # TypeScript types
│   ├── logger.ts             # Logging utility
│   ├── backup.ts             # Backup manager
│   ├── version-manager.ts    # Version validation
│   ├── gradle-parser.ts      # Gradle file parser
│   ├── manifest-parser.ts    # XML manifest parser
│   ├── dependency-analyzer.ts # Conflict detection
│   ├── progress-tracker.ts   # Progress tracking
│   └── __tests__/            # Unit tests
├── .claude/
│   └── agents/android/       # Agent markdown files
└── dist/                     # Built output
```

## Troubleshooting

### Integration Fails

```bash
# Check validation
> Validate my Adster integration

# View available backups
> Rollback to previous backup

# Analyze dependencies
> Analyze my project dependencies
```

### Version Issues

```bash
# Update to latest
> Update Adster to latest version

# Check specific version
> Integrate Adster Custom Adapter version 2.2.1 for AdMob
```

### Build Errors

The agent automatically:
1. Creates backups before changes
2. Validates syntax before writing
3. Offers rollback on failure
4. Provides specific error messages

## Migration from v2.x

v3.0.0 includes breaking changes:

1. **API Key Removed**: Custom Adapter no longer needs API keys
2. **Zone IDs Changed**: Use placement IDs for Orchestration SDK only
3. **New Tools**: Use new validation and analysis tools

To migrate:
```bash
# Update to v3
npm install -g @adstertech/mcp-server@latest

# Re-run integration
> Validate my Adster integration
> # Fix any reported issues
```

## Documentation

- **Custom Adapter**: https://ca-docs.adster.tech/
- **Dashboard**: https://dashboard.adster.tech/
- **Support**: support@adster.tech
- **GitHub**: https://github.com/adster-tech/adster-sdk-agents

## Contributing

We welcome contributions!

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file

## Support

- **Issues**: https://github.com/adster-tech/adster-sdk-agents/issues
- **Email**: support@adster.tech
- **Documentation**: https://ca-docs.adster.tech/

---

**Made with ❤️ by Adster** | Powering mobile advertising worldwide

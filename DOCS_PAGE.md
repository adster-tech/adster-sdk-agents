# Documentation Page for docs.adster.tech

Add this section to your Android integration documentation page.

---

## Automated Integration with Claude Code

Integrate Adster Custom Adapter in 15 minutes with AI-powered automation using Claude Code.

### What is Claude Code?

Claude Code is Anthropic's AI-powered development environment that can understand your codebase and make intelligent changes. The Adster MCP server enables Claude to automatically integrate the Adster Custom Adapter into your Android project for seamless mediation with Google Ad Manager, AdMob, AppLovin MAX, or IronSource LevelPlay.

### Quick Start

#### 1. Install Prerequisites

- **Claude Code**: Download from [claude.com/claude-code](https://claude.com/claude-code)
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **Android Project**: minSdk 21 or higher

#### 2. Install Adster MCP Server

**macOS/Linux:**
```bash
git clone https://github.com/adstertech/adster-mcp-server.git
cd adster-mcp-server
chmod +x install.sh
./install.sh
```

**Windows:**
```cmd
git clone https://github.com/adstertech/adster-mcp-server.git
cd adster-mcp-server
install.bat
```

#### 3. Configure Claude Code

The install script will provide configuration instructions. Add the MCP server to your Claude Code settings:

```json
{
  "mcpServers": {
    "adster-custom-adapter-integrator": {
      "command": "node",
      "args": ["/path/to/adster-mcp-server/dist/index.js"]
    }
  }
}
```

#### 4. Integrate Custom Adapter

Open your Android project in Claude Code and simply ask:

```
Integrate Adster Custom Adapter for AdMob
```

Or specify your preferred ad network:

```
Integrate Adster Custom Adapter for Google Ad Manager
```

Supported ad networks:
- Google Ad Manager (GAM)
- AdMob
- AppLovin MAX
- IronSource LevelPlay

### What Gets Automated

The AI agent automatically:

✅ **Adds Dependencies**
- Updates `build.gradle` with the correct custom adapter for your ad network
- Configures version compatibility

✅ **Configures Permissions**
- Adds `INTERNET` permission
- Adds `ACCESS_NETWORK_STATE` permission

✅ **Sets Up ProGuard**
- Adds required ProGuard rules
- Ensures proper code obfuscation

✅ **Provides Guidance**
- Instructions for configuring Adster in your mediation dashboard
- Guidance on using your ad network's standard APIs
- Best practices for custom adapter integration

✅ **Validates Setup**
- Checks all configuration files
- Identifies missing components
- Provides actionable feedback

### Usage Examples

After installing the MCP server, Claude Code can help with:

**Basic Integration:**
```
Integrate Adster Custom Adapter for AdMob into this Android app
```

**Different Ad Network:**
```
Integrate Adster Custom Adapter for AppLovin MAX
```

**Implementation Help:**
```
Show me how to configure Adster in my Google Ad Manager dashboard
```

**Validation:**
```
Validate my Adster Custom Adapter integration
```

**Documentation:**
```
What are the Adster Custom Adapter requirements?
```

### Integration Flow

1. **Automatic Configuration**
   - Claude analyzes your project structure
   - Adds the correct custom adapter dependency for your ad network
   - Updates AndroidManifest.xml with required permissions
   - Adds ProGuard rules

2. **Smart Guidance**
   - Provides mediation dashboard configuration instructions
   - Explains how to use your ad network's standard APIs
   - Follows Android best practices

3. **Validation & Testing**
   - Verifies all components
   - Checks for common issues
   - Provides fix suggestions

4. **Ongoing Support**
   - Ask questions anytime
   - Get implementation help
   - Troubleshoot issues

### Advanced Features

#### Custom Adapter Version
```
Integrate Adster Custom Adapter for AdMob with version 2.2.1
```

#### Multiple Ad Networks
```
I use both Google Ad Manager and AppLovin. Help me integrate Adster for both.
```

#### Migration from Direct SDK
```
I'm currently using the Adster Orchestration SDK. Help me migrate to the Custom Adapter for Google Ad Manager.
```

#### GDPR Compliance
```
Add GDPR consent flow for Adster custom adapter
```

### Troubleshooting

**Agent Not Found?**
- Ensure install script completed successfully
- Verify configuration path is absolute
- Restart Claude Code

**Integration Incomplete?**
Run validation:
```
@agent-adster-android-integrator validate my integration
```

**Build Errors?**
Ask Claude:
```
I'm getting build errors after integrating Adster Custom Adapter
```

### Benefits

🚀 **15-Minute Setup** - Quick custom adapter integration
🤖 **AI-Powered** - Intelligent integration decisions
✅ **Validated** - Automatic checks for common issues
📚 **Documented** - Built-in custom adapter documentation
🔧 **Flexible** - Works with 4 major ad networks
🛡️ **Safe** - Preserves existing mediation setup

### Requirements

| Component | Version |
|-----------|---------|
| minSdkVersion | 21+ |
| compileSdkVersion | 33+ |
| Claude Code | Latest |
| Node.js | 18+ |

### Next Steps

After integration:

1. **Sync Project** - Sync Gradle files in Android Studio
2. **Configure Mediation Dashboard** - Add Adster as a custom network in your mediation platform
3. **Get Credentials** - Obtain API keys from Adster dashboard
4. **Use Standard APIs** - Load ads using your ad network's standard APIs
5. **Test** - Run your app and verify Adster ads serve through mediation

### Resources

- [MCP Server Repository](https://github.com/adstertech/adster-mcp-server)
- [Claude Code Documentation](https://docs.claude.ai/claude-code)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Adster Custom Adapter Docs](https://ca-docs.adster.tech/)

### Support

Need help? Claude Code can assist, or contact:
- 📧 Email: support@adster.tech
- 💬 GitHub Issues: [adster-mcp-server/issues](https://github.com/adstertech/adster-mcp-server/issues)

---

**Ready to get started?** Install the MCP server and let AI handle your Adster SDK integration!

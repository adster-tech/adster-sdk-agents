# Quick Start Guide

Get your Adster Custom Adapter MCP server running in 5 minutes!

## Step 1: Clone and Build

```bash
# Clone the repository
git clone https://github.com/adstertech/adster-mcp-server.git
cd adster-mcp-server

# Install and build (macOS/Linux)
./install.sh

# Or on Windows
install.bat
```

## Step 2: Configure Claude Code

Add the MCP server to your Claude Code configuration file:

### macOS/Linux
Edit `~/.claude/config.json`:

```json
{
  "mcpServers": {
    "adster-custom-adapter-integrator": {
      "command": "node",
      "args": ["/absolute/path/to/adster-mcp-server/dist/index.js"]
    }
  }
}
```

### Windows
Edit `%APPDATA%\Claude\config.json`:

```json
{
  "mcpServers": {
    "adster-custom-adapter-integrator": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\adster-mcp-server\\dist\\index.js"]
    }
  }
}
```

**Important**: Use the **absolute path** to `dist/index.js`!

## Step 3: Restart Claude Code

Close and reopen Claude Code completely for the MCP server to load.

## Step 4: Integrate Adster Custom Adapter

Open your Android project in Claude Code and ask:

```
Integrate Adster Custom Adapter for AdMob
```

Or specify your ad network:

```
Integrate Adster Custom Adapter for Google Ad Manager
Integrate Adster Custom Adapter for AppLovin MAX
Integrate Adster Custom Adapter for IronSource LevelPlay
```

## Step 5: Complete Dashboard Configuration

Follow the instructions provided by Claude to:
1. Configure Adster in your mediation dashboard
2. Add Adster credentials from https://dashboard.adster.tech/
3. Set up ad unit mappings

## That's It!

The custom adapter will automatically serve Adster ads through your existing mediation code. No additional code changes needed!

## Alternative: Copy Agents to Your Project

For direct agent access without the MCP server:

```bash
# Copy agents to your Android project
cp -r .claude /path/to/your/android/project/

# In Claude Code, use:
@adster-custom-adapter-integrator integrate Adster Custom Adapter for AdMob

# For Codex CLI sessions, also copy:
cp -r .codex /path/to/your/android/project/

# Then run `codex` inside that project and use the same agent prompts.
```

## Need Help?

- **Documentation**: https://ca-docs.adster.tech/
- **Dashboard**: https://dashboard.adster.tech/
- **Support**: support@adster.tech

## What's Next?

Ask Claude to:
- `Show me Adster Custom Adapter documentation`
- `Validate my Adster Custom Adapter integration`
- `Help me configure Adster in my Google Ad Manager dashboard`

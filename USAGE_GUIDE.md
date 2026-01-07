# How to Use Adster Agents in Your Android Project

## Option 1: Claude Code Agents (Recommended for Quick Testing)

### Step 1: Copy Agents to Your Project

```bash
# Navigate to your Android project
cd /path/to/your/android/project

# Copy the .claude directory
cp -r /Users/adster/Desktop/Github/adster-mcp-server/.claude .

# Verify it was copied
ls -la .claude/agents/android/
```

**Example:**
```bash
cd ~/AndroidStudioProjects/MyApp
cp -r /Users/adster/Desktop/Github/adster-mcp-server/.claude .
```

> ℹ️ **Codex CLI**: For Codex sessions, also copy the `.codex` folder so the prompts are available locally:
> ```bash
> cp -r /Users/adster/Desktop/Github/adster-mcp-server/.codex .
> ```

### Step 2: Open Project in Claude Code

```bash
# Open your project in Claude Code
claude-code .

# Or if you're already in the project directory:
code .  # If using VS Code with Claude Code extension
```

### Step 3: Use the Agents

Now you can use agents with the `@` mention:

**Integrate Adster Custom Adapter:**
```
@adster-android-integrator integrate Adster Custom Adapter for AdMob
```

**Audit existing integration:**
```
@adster-android-auditor check my Adster SDK implementation
```

**Verify build:**
```
@adster-android-build-verifier run a debug build and check for errors
```

**Check privacy:**
```
@adster-android-privacy-checker validate my GDPR compliance
```

### Step 4: Try a Complete Integration

Open Claude Code and try this:

```
@adster-android-integrator I want to integrate Adster Custom Adapter for Google Ad Manager.
```

The agent will:
1. Add the appropriate custom adapter dependency to build.gradle
2. Add required permissions to AndroidManifest.xml
3. Add ProGuard rules
4. Provide instructions for configuring Adster in your mediation dashboard
5. Guide you through using your ad network's standard APIs

### Using the Same Agents with Codex CLI

1. Copy both `.claude` and `.codex` directories into your Android project (or run the installer with `--client=codex`).
2. From the project root, launch Codex with `codex`.
3. Use the same `@adster-custom-adapter-integrator` or `@adster-android-integrator` prompts—the commands and workflow are identical to Claude Code.
4. When you're done, keep the `.codex` folder with your project so future Codex sessions can reuse the agents.

---

## Option 2: MCP Server (For Production Use)

The MCP server runs as a background service and provides automated tools.

### Step 1: Build the MCP Server

```bash
cd /Users/adster/Desktop/Github/adster-mcp-server
npm run build
```

Verify build:
```bash
ls -la dist/index.js
```

### Step 2: Configure Claude Code

Add the MCP server to Claude Code's configuration:

**On macOS/Linux:**
```bash
# Edit Claude Code config
nano ~/.claude/config.json
```

**On Windows:**
```cmd
# Edit Claude Code config
notepad %APPDATA%\Claude\config.json
```

**Add this configuration:**
```json
{
  "mcpServers": {
    "adster-custom-adapter-integrator": {
      "command": "node",
      "args": ["/Users/adster/Desktop/Github/adster-mcp-server/dist/index.js"]
    }
  }
}
```

**Important:** Use the absolute path to dist/index.js!

### Step 3: Restart Claude Code

Close and reopen Claude Code completely to load the MCP server.

### Step 4: Use MCP Server Tools

Navigate to your Android project and use the MCP tools:

**Integrate Custom Adapter:**
```
Use the adster-custom-adapter-integrator MCP server to integrate Adster Custom Adapter for AdMob into this project
```

Or specify your ad network:
```
Integrate Adster Custom Adapter for Google Ad Manager
```

Available ad networks:
- Google Ad Manager (GAM)
- AdMob
- AppLovin MAX
- IronSource LevelPlay

**Validate integration:**
```
Validate my Adster SDK integration using the MCP server
```

**Get documentation:**
```
Show me Adster Custom Adapter documentation
```

---

## 🧪 Quick Test - Try Both Methods

### Test Project Setup

1. **Create or use an existing Android project:**
```bash
# If you don't have one, create a new Android project in Android Studio
# File > New > New Project > Empty Activity
```

2. **Open in Claude Code:**
```bash
cd /path/to/your/android/project
code .
```

### Test Scenario 1: Agent Method

```bash
# Copy agents
cp -r /Users/adster/Desktop/Github/adster-mcp-server/.claude .

# In Claude Code, type:
@adster-android-integrator integrate Adster Custom Adapter for AdMob
```

### Test Scenario 2: MCP Server Method

```bash
# Configure MCP server in ~/.claude/config.json
# Restart Claude Code

# In Claude Code, type:
Use the adster-custom-adapter-integrator to integrate Adster Custom Adapter for Google Ad Manager
```

---

## 📊 Comparison

| Feature | Claude Code Agents | MCP Server |
|---------|-------------------|------------|
| Setup | Copy .claude folder | Configure config.json |
| Usage | @agent-name | Natural language |
| Speed | Instant | Instant |
| Best For | Quick testing, direct control | Production, automation |
| Portability | Per-project | Global |
| Updates | Copy new files | Rebuild & restart |

---

## 🎯 Recommended Workflow

### For Your First Test:

1. **Use Agents** (easier setup):
```bash
cd ~/AndroidStudioProjects/TestApp
cp -r /Users/adster/Desktop/Github/adster-mcp-server/.claude .
code .
```

2. **Try integration:**
```
@adster-android-integrator integrate Adster Custom Adapter for AdMob
```

3. **Verify it works:**
```
@adster-android-build-verifier verify the project builds successfully
```

4. **Audit the result:**
```
@adster-android-auditor check if the integration is correct
```

### For Production:

Set up the MCP server once, then use it across all projects without copying files.

---

## 🐛 Troubleshooting

### Agent Not Found

**Problem:**
```
Agent @adster-android-integrator not found
```

**Solution:**
```bash
# Verify .claude folder exists
ls -la .claude/agents/android/

# Make sure files are there
ls -la .claude/agents/android/adster-android-integrator.md

# Restart Claude Code
```

### MCP Server Not Loading

**Problem:**
```
MCP server 'adster-custom-adapter-integrator' failed to start
```

**Solution:**
```bash
# Verify build
cd /Users/adster/Desktop/Github/adster-mcp-server
npm run build

# Test server manually
node dist/index.js
# Should output: "Adster MCP server running on stdio"

# Check config.json path is absolute
cat ~/.claude/config.json

# Restart Claude Code
```

### Build Fails After Integration

**Problem:**
Build errors after agent integration

**Solution:**
```
@adster-android-build-verifier diagnose the build errors and fix them
```

Or:
```
@adster-android-auditor audit my integration and find issues
```

---

## 💡 Example Use Cases

### Use Case 1: New Integration
```
@adster-android-integrator I have a news app using AdMob mediation. Integrate Adster Custom Adapter for AdMob.
```

### Use Case 2: Audit Existing Code
```
@adster-android-auditor I already have Adster SDK in my project. Check if I'm using it correctly and find any issues.
```

### Use Case 3: Fix Build Issues
```
@adster-android-build-verifier My project won't build after adding Adster Custom Adapter. Find and fix the compilation errors.
```

### Use Case 4: Privacy Compliance
```
@adster-android-privacy-checker I need to publish to Google Play. Check if my privacy implementation meets GDPR and CCPA requirements.
```

### Use Case 5: Different Ad Network
```
@adster-android-integrator I'm using AppLovin MAX. Integrate Adster Custom Adapter for AppLovin.
```

---

## 🚀 Next Steps

After successful integration:

1. **Get placement IDs** from Adster dashboard
2. **Replace placeholders** in code
3. **Test ads** in debug mode
4. **Run audit:**
```
@adster-android-auditor do a final audit before production
```
5. **Check privacy:**
```
@adster-android-privacy-checker verify I'm ready for Play Store submission
```

---

## 📱 Real Example

Let's say you have an Android project at `~/AndroidStudioProjects/NewsApp`:

```bash
# Step 1: Copy agents
cd ~/AndroidStudioProjects/NewsApp
cp -r /Users/adster/Desktop/Github/adster-mcp-server/.claude .

# Step 2: Open in Claude Code
code .

# Step 3: In Claude Code chat, type:
@adster-android-integrator integrate Adster Custom Adapter for Google Ad Manager.
I want to use Adster as an additional ad network in my existing GAM mediation setup.

# Step 4: Build and verify
@adster-android-build-verifier build the project and check for errors

# Step 5: Audit
@adster-android-auditor audit the entire integration

# Step 6: Privacy check
@adster-android-privacy-checker check GDPR compliance
```

The agents will handle everything automatically! 🎉

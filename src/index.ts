#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";

type AdNetwork = "gam" | "admob" | "applovin" | "ironsource";

interface IntegrationConfig {
  adNetwork: AdNetwork;
  sdkVersion?: string;
  minSdkVersion?: number;
  compileSdkVersion?: number;
  targetSdkVersion?: number;
}

const ADSTER_SDK_DOCS = `
# Adster Custom Adapter Integration Guide

## Overview
The Adster Custom Adapter enables integration with Adster as a third-party ad network mediation partner.
It works seamlessly with your existing ad mediation platform.

## Supported Ad Networks
- Google Ad Manager (GAM)
- AdMob
- AppLovin MAX
- IronSource LevelPlay

## Requirements
- minSdkVersion: 21 or higher
- compileSdkVersion: 33 or higher
- targetSdkVersion: 33 or higher

## Dependencies
Choose the dependency based on your ad network:

### Google Ad Manager or AdMob:
\`\`\`gradle
implementation 'com.adstertech:customadapter-lite:2.2.1'
\`\`\`

### AppLovin MAX:
\`\`\`gradle
implementation 'com.adstertech:customadapter-applovin:2.1.4'
\`\`\`

### IronSource LevelPlay:
\`\`\`gradle
implementation 'com.adstertech:customadapter-ironsource:2.1.4'
\`\`\`

## Permissions
Add to AndroidManifest.xml:
\`\`\`xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
\`\`\`

## ProGuard Rules
Add to proguard-rules.pro:
\`\`\`
-keep class com.adster.** { *; }
\`\`\`

## Usage
The custom adapter integrates automatically with your chosen ad network's mediation platform.
Configure Adster as a custom network in your mediation platform's dashboard and use the
ad network's standard ad loading APIs. The custom adapter handles the communication with Adster.

For detailed setup instructions specific to your ad network, visit: https://ca-docs.adster.tech/
`;

class AdsterIntegrationServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "adster-custom-adapter-integrator",
        version: "2.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "integrate_adster_custom_adapter",
          description:
            "Integrates Adster Custom Adapter into an Android project. Modifies build.gradle with the appropriate custom adapter dependency based on your ad network, updates AndroidManifest.xml, and adds ProGuard rules. Supports Google Ad Manager, AdMob, AppLovin MAX, and IronSource LevelPlay.",
          inputSchema: {
            type: "object",
            properties: {
              projectPath: {
                type: "string",
                description: "Path to the Android project root directory",
              },
              adNetwork: {
                type: "string",
                enum: ["gam", "admob", "applovin", "ironsource"],
                description:
                  "Ad network to integrate with: 'gam' (Google Ad Manager), 'admob' (AdMob), 'applovin' (AppLovin MAX), or 'ironsource' (IronSource LevelPlay)",
              },
              sdkVersion: {
                type: "string",
                description:
                  "Optional: Custom adapter version. Defaults: 2.2.1 for GAM/AdMob, 2.1.4 for AppLovin/IronSource",
              },
            },
            required: ["projectPath", "adNetwork"],
          },
        } as Tool,
        {
          name: "get_adster_docs",
          description:
            "Returns comprehensive Adster Custom Adapter documentation including integration steps, supported ad networks, and setup instructions",
          inputSchema: {
            type: "object",
            properties: {},
          },
        } as Tool,
        {
          name: "validate_adster_integration",
          description:
            "Validates an existing Adster Custom Adapter integration by checking build.gradle dependencies, AndroidManifest.xml permissions, ProGuard rules, and version compatibility",
          inputSchema: {
            type: "object",
            properties: {
              projectPath: {
                type: "string",
                description: "Path to the Android project root directory",
              },
            },
            required: ["projectPath"],
          },
        } as Tool,
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        if (name === "get_adster_docs") {
          return {
            content: [
              {
                type: "text",
                text: ADSTER_SDK_DOCS,
              },
            ],
          };
        }

        if (!args) {
          throw new Error("Missing required arguments");
        }

        if (name === "integrate_adster_custom_adapter") {
          const adNetwork = args.adNetwork as AdNetwork;

          // Set default version based on ad network
          let defaultVersion = "2.2.1";
          if (adNetwork === "applovin" || adNetwork === "ironsource") {
            defaultVersion = "2.1.4";
          }

          const config: IntegrationConfig = {
            adNetwork,
            sdkVersion: (args.sdkVersion as string) || defaultVersion,
            minSdkVersion: 21,
            compileSdkVersion: 33,
            targetSdkVersion: 33,
          };

          const result = await this.integrateCustomAdapter(
            args.projectPath as string,
            config
          );
          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };
        }

        if (name === "validate_adster_integration") {
          const result = await this.validateIntegration(
            args.projectPath as string
          );
          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async integrateCustomAdapter(
    projectPath: string,
    config: IntegrationConfig
  ): Promise<string> {
    const results: string[] = [];
    const adNetworkName = this.getAdNetworkName(config.adNetwork);
    results.push(`🚀 Starting Adster Custom Adapter integration for ${adNetworkName}...\n`);

    // 1. Update build.gradle (app level)
    const buildGradlePath = join(projectPath, "app", "build.gradle");
    if (existsSync(buildGradlePath)) {
      const gradleResult = await this.updateBuildGradle(
        buildGradlePath,
        config
      );
      results.push(gradleResult);
    } else {
      const ktsPath = buildGradlePath + ".kts";
      if (existsSync(ktsPath)) {
        const gradleResult = await this.updateBuildGradleKts(ktsPath, config);
        results.push(gradleResult);
      } else {
        results.push("❌ build.gradle not found at app level");
      }
    }

    // 2. Update AndroidManifest.xml
    const manifestPath = join(
      projectPath,
      "app",
      "src",
      "main",
      "AndroidManifest.xml"
    );
    if (existsSync(manifestPath)) {
      const manifestResult = await this.updateManifest(manifestPath);
      results.push(manifestResult);
    } else {
      results.push("❌ AndroidManifest.xml not found");
    }

    // 3. Update ProGuard rules
    const proguardPath = join(projectPath, "app", "proguard-rules.pro");
    if (existsSync(proguardPath)) {
      const proguardResult = await this.updateProGuard(proguardPath);
      results.push(proguardResult);
    } else {
      results.push("⚠️  proguard-rules.pro not found (creating new file)");
      await writeFile(
        proguardPath,
        "-keep class com.adster.** { *; }\n",
        "utf8"
      );
      results.push("✅ Created proguard-rules.pro with Adster rules");
    }

    results.push("\n✨ Integration complete!");
    results.push("\n📚 Next steps:");
    results.push("1. Sync your project with Gradle files");
    results.push(`2. Configure Adster as a custom network in your ${adNetworkName} mediation dashboard`);
    results.push("3. Use your ad network's standard APIs to load ads");
    results.push("4. The custom adapter will automatically handle communication with Adster");
    results.push(
      "\nFor detailed platform-specific setup, visit https://ca-docs.adster.tech/"
    );

    return results.join("\n");
  }

  private getAdNetworkName(adNetwork: AdNetwork): string {
    switch (adNetwork) {
      case "gam":
        return "Google Ad Manager";
      case "admob":
        return "AdMob";
      case "applovin":
        return "AppLovin MAX";
      case "ironsource":
        return "IronSource LevelPlay";
    }
  }

  private getCustomAdapterDependency(config: IntegrationConfig): string {
    if (config.adNetwork === "gam" || config.adNetwork === "admob") {
      return `com.adstertech:customadapter-lite:${config.sdkVersion}`;
    } else if (config.adNetwork === "applovin") {
      return `com.adstertech:customadapter-applovin:${config.sdkVersion}`;
    } else {
      return `com.adstertech:customadapter-ironsource:${config.sdkVersion}`;
    }
  }

  private async updateBuildGradle(
    path: string,
    config: IntegrationConfig
  ): Promise<string> {
    let content = await readFile(path, "utf8");
    const dependency = `implementation '${this.getCustomAdapterDependency(config)}'`;

    // Check if already added
    if (content.includes("com.adstertech:customadapter")) {
      return "✅ Adster Custom Adapter dependency already present in build.gradle";
    }

    // Remove old orchestration SDK if present
    if (content.includes("com.adstertech:orchestrationsdk")) {
      content = content.replace(/\s*implementation\s+['"]com\.adstertech:orchestrationsdk[^'"]*['"]\s*/g, "");
    }

    // Add dependency to dependencies block
    if (content.includes("dependencies {")) {
      content = content.replace(
        /dependencies\s*{/,
        `dependencies {\n    ${dependency}`
      );
      await writeFile(path, content, "utf8");
      return "✅ Added Adster Custom Adapter dependency to build.gradle";
    } else {
      return "⚠️  Could not find dependencies block in build.gradle - please add manually:\n" +
        dependency;
    }
  }

  private async updateBuildGradleKts(
    path: string,
    config: IntegrationConfig
  ): Promise<string> {
    let content = await readFile(path, "utf8");
    const dependency = `implementation("${this.getCustomAdapterDependency(config)}")`;

    if (content.includes("com.adstertech:customadapter")) {
      return "✅ Adster Custom Adapter dependency already present in build.gradle.kts";
    }

    // Remove old orchestration SDK if present
    if (content.includes("com.adstertech:orchestrationsdk")) {
      content = content.replace(/\s*implementation\(["']com\.adstertech:orchestrationsdk[^"']*["']\)\s*/g, "");
    }

    if (content.includes("dependencies {")) {
      content = content.replace(
        /dependencies\s*{/,
        `dependencies {\n    ${dependency}`
      );
      await writeFile(path, content, "utf8");
      return "✅ Added Adster Custom Adapter dependency to build.gradle.kts";
    } else {
      return "⚠️  Could not find dependencies block - please add manually:\n" +
        dependency;
    }
  }

  private async updateManifest(path: string): Promise<string> {
    let content = await readFile(path, "utf8");
    const results: string[] = [];

    // Add INTERNET permission
    if (!content.includes("android.permission.INTERNET")) {
      const internetPermission = '<uses-permission android:name="android.permission.INTERNET" />';
      content = content.replace(
        /<manifest/,
        `<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    ${internetPermission}`
      );
      results.push("✅ Added INTERNET permission");
    } else {
      results.push("✅ INTERNET permission already present");
    }

    // Add ACCESS_NETWORK_STATE permission
    if (!content.includes("android.permission.ACCESS_NETWORK_STATE")) {
      const networkStatePermission = '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />';
      content = content.replace(
        /(<uses-permission[^>]*>)/,
        `$1\n    ${networkStatePermission}`
      );
      results.push("✅ Added ACCESS_NETWORK_STATE permission");
    } else {
      results.push("✅ ACCESS_NETWORK_STATE permission already present");
    }

    await writeFile(path, content, "utf8");
    return results.join("\n");
  }

  private async updateProGuard(path: string): Promise<string> {
    let content = await readFile(path, "utf8");
    const rule = "-keep class com.adster.** { *; }";

    if (content.includes(rule)) {
      return "✅ ProGuard rules already present";
    }

    content += `\n# Adster Custom Adapter\n${rule}\n`;
    await writeFile(path, content, "utf8");
    return "✅ Added Adster ProGuard rules";
  }

  private async validateIntegration(projectPath: string): Promise<string> {
    const results: string[] = [];
    results.push("🔍 Validating Adster Custom Adapter integration...\n");

    let score = 0;
    const maxScore = 4;

    // Check build.gradle
    const buildGradlePath = join(projectPath, "app", "build.gradle");
    const buildGradleKtsPath = buildGradlePath + ".kts";

    let gradleContent = "";
    if (existsSync(buildGradlePath)) {
      gradleContent = await readFile(buildGradlePath, "utf8");
    } else if (existsSync(buildGradleKtsPath)) {
      gradleContent = await readFile(buildGradleKtsPath, "utf8");
    }

    if (gradleContent.includes("com.adstertech:customadapter")) {
      results.push("✅ Adster Custom Adapter dependency found");
      score++;
    } else {
      results.push("❌ Adster Custom Adapter dependency not found in build.gradle");
    }

    // Check AndroidManifest.xml
    const manifestPath = join(
      projectPath,
      "app",
      "src",
      "main",
      "AndroidManifest.xml"
    );
    if (existsSync(manifestPath)) {
      const manifestContent = await readFile(manifestPath, "utf8");

      if (manifestContent.includes("android.permission.INTERNET")) {
        results.push("✅ INTERNET permission found");
        score++;
      } else {
        results.push("❌ INTERNET permission missing");
      }

      if (manifestContent.includes("android.permission.ACCESS_NETWORK_STATE")) {
        results.push("✅ ACCESS_NETWORK_STATE permission found");
        score++;
      } else {
        results.push("❌ ACCESS_NETWORK_STATE permission missing");
      }
    } else {
      results.push("❌ AndroidManifest.xml not found");
    }

    // Check ProGuard rules
    const proguardPath = join(projectPath, "app", "proguard-rules.pro");
    if (existsSync(proguardPath)) {
      const proguardContent = await readFile(proguardPath, "utf8");
      if (proguardContent.includes("-keep class com.adster.** { *; }")) {
        results.push("✅ ProGuard rules found");
        score++;
      } else {
        results.push("❌ ProGuard rules missing");
      }
    } else {
      results.push("⚠️  proguard-rules.pro not found");
    }

    results.push(`\n📊 Integration Score: ${score}/${maxScore}`);

    if (score === maxScore) {
      results.push("🎉 Perfect! Your Adster Custom Adapter integration is complete.");
    } else if (score >= 2) {
      results.push("⚠️  Integration partially complete. Please fix the issues above.");
    } else {
      results.push("❌ Integration incomplete. Please run 'integrate_adster_custom_adapter' tool.");
    }

    return results.join("\n");
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Adster MCP server running on stdio");
  }
}

const server = new AdsterIntegrationServer();
server.run().catch(console.error);

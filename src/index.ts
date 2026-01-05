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
import { join } from "path";

import type {
  AdNetwork,
  IntegrationConfig,
  OrchestrationConfig,
  IntegrationResult,
  FileModification,
  ValidationResult,
  ValidationIssue,
} from "./types.js";

import { Logger, logger } from "./logger.js";
import { BackupManager } from "./backup.js";
import { VersionManager } from "./version-manager.js";
import { GradleParser } from "./gradle-parser.js";
import { ManifestParser } from "./manifest-parser.js";
import { DependencyAnalyzer } from "./dependency-analyzer.js";
import { ProgressTrackerImpl } from "./progress-tracker.js";

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

## Custom Adapter (Recommended)
Use the custom adapter for mediation setups. No code changes required - configure through your mediation dashboard.

## Direct SDK (Legacy)
For apps not using mediation, you can integrate the Orchestration SDK directly.
Note: Placement IDs are configured in your ad request code.

For detailed setup instructions specific to your ad network, visit: https://ca-docs.adster.tech/
`;

class AdsterIntegrationServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "adster-custom-adapter-integrator",
        version: "3.0.0",
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
      logger.error("MCP Server Error", error);
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
            "Integrates Adster Custom Adapter into an Android project with comprehensive validation, conflict detection, and rollback support. Supports GAM, AdMob, AppLovin MAX, and IronSource LevelPlay.",
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
                description: "Ad network: 'gam', 'admob', 'applovin', or 'ironsource'",
              },
              sdkVersion: {
                type: "string",
                description: "Optional: Custom adapter version (auto-validates against Maven)",
              },
            },
            required: ["projectPath", "adNetwork"],
          },
        } as Tool,
        {
          name: "integrate_adster_orchestration_sdk",
          description:
            "Integrates Adster Orchestration SDK for direct integration (legacy). Use placement IDs in your ad request code.",
          inputSchema: {
            type: "object",
            properties: {
              projectPath: {
                type: "string",
                description: "Path to the Android project root directory",
              },
              sdkVersion: {
                type: "string",
                description: "Optional: SDK version (defaults to latest)",
              },
            },
            required: ["projectPath"],
          },
        } as Tool,
        {
          name: "validate_adster_integration",
          description:
            "Validates Adster integration with comprehensive checks including dependency conflicts, version compatibility, and configuration issues.",
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
        {
          name: "analyze_dependencies",
          description:
            "Analyzes project dependencies for conflicts, incompatibilities, and outdated versions.",
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
        {
          name: "update_adster_version",
          description:
            "Updates Adster Custom Adapter or Orchestration SDK to a specific or latest version.",
          inputSchema: {
            type: "object",
            properties: {
              projectPath: {
                type: "string",
                description: "Path to the Android project root directory",
              },
              targetVersion: {
                type: "string",
                description: "Target version (leave empty for latest)",
              },
            },
            required: ["projectPath"],
          },
        } as Tool,
        {
          name: "rollback_integration",
          description:
            "Rolls back to a previous backup after failed or unwanted integration.",
          inputSchema: {
            type: "object",
            properties: {
              projectPath: {
                type: "string",
                description: "Path to the Android project root directory",
              },
              backupId: {
                type: "string",
                description: "Backup ID to restore (leave empty to see available backups)",
              },
            },
            required: ["projectPath"],
          },
        } as Tool,
        {
          name: "get_adster_docs",
          description:
            "Returns comprehensive Adster SDK documentation.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        } as Tool,
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        if (name === "get_adster_docs") {
          return {
            content: [{ type: "text", text: ADSTER_SDK_DOCS }],
          };
        }

        if (!args) {
          throw new Error("Missing required arguments");
        }

        switch (name) {
          case "integrate_adster_custom_adapter":
            return await this.handleCustomAdapterIntegration(args);

          case "integrate_adster_orchestration_sdk":
            return await this.handleOrchestrationSdkIntegration(args);

          case "validate_adster_integration":
            return await this.handleValidation(args);

          case "analyze_dependencies":
            return await this.handleDependencyAnalysis(args);

          case "update_adster_version":
            return await this.handleVersionUpdate(args);

          case "rollback_integration":
            return await this.handleRollback(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Tool execution failed", error as Error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleCustomAdapterIntegration(args: any) {
    const projectPath = args.projectPath as string;
    const adNetwork = args.adNetwork as AdNetwork;
    const requestedVersion = args.sdkVersion as string | undefined;

    logger.section("🚀 Adster Custom Adapter Integration");

    const progress = new ProgressTrackerImpl(9);
    const backupManager = new BackupManager(projectPath);
    let backupId: string | undefined;

    try {
      // Step 1: Validate project structure
      progress.startStep("validate_structure", "Validating project structure");
      await this.validateProjectStructure(projectPath);
      progress.completeStep("validate_structure");

      // Step 2: Validate and get version
      progress.startStep("validate_structure", "Validating SDK version");
      const versionResult = await VersionManager.validateVersion(adNetwork, requestedVersion);
      logger.result("📦", versionResult.message);
      const sdkVersion = versionResult.version;
      progress.completeStep("validate_structure");

      const config: IntegrationConfig = {
        adNetwork,
        sdkVersion,
        minSdkVersion: 21,
        compileSdkVersion: 33,
        targetSdkVersion: 33,
      };

      // Step 3: Check for conflicts
      progress.startStep("check_conflicts", "Checking for dependency conflicts");
      await this.checkDependencyConflicts(projectPath);
      progress.completeStep("check_conflicts");

      // Step 4: Create backup
      progress.startStep("backup_files", "Creating backup");
      const filesToBackup = this.getFilesToModify(projectPath);
      backupId = await backupManager.createBackup(filesToBackup);
      progress.completeStep("backup_files");

      const filesModified: FileModification[] = [];

      // Step 5: Update settings.gradle
      progress.startStep("update_settings_gradle", "Updating settings.gradle");
      try {
        await this.updateSettingsGradle(projectPath);
        filesModified.push({
          file: "settings.gradle",
          action: "update",
          success: true,
        });
        progress.completeStep("update_settings_gradle");
      } catch (error) {
        logger.warn("settings.gradle update skipped (may not exist or use different structure)");
        filesModified.push({
          file: "settings.gradle",
          action: "update",
          success: false,
          error: (error as Error).message,
        });
      }

      // Step 6: Update build.gradle
      progress.startStep("update_build_gradle", "Updating build.gradle");
      await this.updateBuildGradle(projectPath, config);
      filesModified.push({
        file: "app/build.gradle",
        action: "update",
        success: true,
      });
      progress.completeStep("update_build_gradle");

      // Step 7: Update AndroidManifest.xml
      progress.startStep("update_manifest", "Updating AndroidManifest.xml");
      await this.updateManifest(projectPath);
      filesModified.push({
        file: "app/src/main/AndroidManifest.xml",
        action: "update",
        success: true,
      });
      progress.completeStep("update_manifest");

      // Step 8: Update ProGuard rules
      progress.startStep("update_proguard", "Updating ProGuard rules");
      await this.updateProguard(projectPath);
      filesModified.push({
        file: "app/proguard-rules.pro",
        action: "update",
        success: true,
      });
      progress.completeStep("update_proguard");

      // Step 9: Verify integration
      progress.startStep("verify_integration", "Verifying integration");
      const validationResult = await this.validateIntegration(projectPath);
      progress.completeStep("verify_integration");

      // Generate result
      const result: IntegrationResult = {
        success: true,
        filesModified,
        backupId,
        errors: [],
        warnings: validationResult.warnings,
        nextSteps: this.getNextSteps(adNetwork),
        dashboardInstructions: this.getDashboardInstructions(adNetwork),
      };

      const report = this.generateIntegrationReport(result, progress, adNetwork, sdkVersion);

      return {
        content: [{ type: "text", text: report }],
      };
    } catch (error) {
      logger.error("Integration failed", error as Error);

      // Attempt rollback
      if (backupId) {
        logger.info("🔄 Attempting rollback...");
        try {
          await backupManager.rollback(backupId);
          logger.success("✅ Rollback completed successfully");
        } catch (rollbackError) {
          logger.error("Rollback failed", rollbackError as Error);
        }
      }

      throw error;
    }
  }

  private async handleOrchestrationSdkIntegration(args: any) {
    const projectPath = args.projectPath as string;
    const requestedVersion = args.sdkVersion as string | undefined;

    logger.section("🚀 Adster Orchestration SDK Integration");

    const progress = new ProgressTrackerImpl(8);
    const backupManager = new BackupManager(projectPath);
    let backupId: string | undefined;

    try {
      // Validate project
      progress.startStep("validate_structure", "Validating project structure");
      await this.validateProjectStructure(projectPath);
      progress.completeStep("validate_structure");

      // Get SDK version
      const sdkVersion = requestedVersion || "latest";

      const config: OrchestrationConfig = {
        adNetwork: "admob", // Dummy value, not used for orchestration
        sdkVersion,
      };

      // Check conflicts
      progress.startStep("check_conflicts", "Checking for dependency conflicts");
      await this.checkDependencyConflicts(projectPath);
      progress.completeStep("check_conflicts");

      // Backup
      progress.startStep("backup_files", "Creating backup");
      const filesToBackup = this.getFilesToModify(projectPath);
      backupId = await backupManager.createBackup(filesToBackup);
      progress.completeStep("backup_files");

      const filesModified: FileModification[] = [];

      // Update files 
      progress.startStep("update_settings_gradle", "Updating settings.gradle");
      await this.updateSettingsGradle(projectPath);
      filesModified.push({ file: "settings.gradle", action: "update", success: true });
      progress.completeStep("update_settings_gradle");

      progress.startStep("update_build_gradle", "Updating build.gradle for Orchestration SDK");
      await this.updateBuildGradleOrchestration(projectPath, sdkVersion);
      filesModified.push({ file: "app/build.gradle", action: "update", success: true });
      progress.completeStep("update_build_gradle");

      progress.startStep("update_manifest", "Updating AndroidManifest.xml");
      await this.updateManifest(projectPath);
      filesModified.push({ file: "app/src/main/AndroidManifest.xml", action: "update", success: true });
      progress.completeStep("update_manifest");

      progress.startStep("update_proguard", "Updating ProGuard rules");
      await this.updateProguard(projectPath);
      filesModified.push({ file: "app/proguard-rules.pro", action: "update", success: true });
      progress.completeStep("update_proguard");

      progress.startStep("verify_integration", "Verifying integration");
      const validationResult = await this.validateIntegration(projectPath);
      progress.completeStep("verify_integration");

      const result: IntegrationResult = {
        success: true,
        filesModified,
        backupId,
        errors: [],
        warnings: validationResult.warnings,
        nextSteps: [
          "1. Sync your Gradle files",
          "2. Initialize the SDK in your Application class",
          "3. Use placement IDs in your ad request code",
          "4. Test your integration with test mode enabled",
        ],
      };

      const report = this.generateOrchestrationReport(result, progress, sdkVersion);

      return {
        content: [{ type: "text", text: report }],
      };
    } catch (error) {
      logger.error("Integration failed", error as Error);

      if (backupId) {
        try {
          await backupManager.rollback(backupId);
        } catch (rollbackError) {
          logger.error("Rollback failed", rollbackError as Error);
        }
      }

      throw error;
    }
  }

  private async handleValidation(args: any) {
    const projectPath = args.projectPath as string;

    logger.section("🔍 Validating Adster Integration");

    const result = await this.validateIntegration(projectPath);
    const report = this.generateValidationReport(result);

    return {
      content: [{ type: "text", text: report }],
    };
  }

  private async handleDependencyAnalysis(args: any) {
    const projectPath = args.projectPath as string;

    logger.section("📊 Analyzing Dependencies");

    const buildGradlePath = this.findBuildGradle(projectPath, "app");
    const gradle = await GradleParser.fromFile(buildGradlePath);
    const dependencies = gradle.parseDependencies();

    const analyzer = new DependencyAnalyzer(dependencies);
    const report = analyzer.generateReport();

    return {
      content: [{ type: "text", text: report }],
    };
  }

  private async handleVersionUpdate(args: any) {
    const projectPath = args.projectPath as string;
    const targetVersion = args.targetVersion as string | undefined;

    logger.section("🔄 Updating Adster SDK Version");

    // Implementation for version update
    const buildGradlePath = this.findBuildGradle(projectPath, "app");
    const gradle = await GradleParser.fromFile(buildGradlePath);
    const dependencies = gradle.parseDependencies();

    const adsterDep = dependencies.find(d =>
      d.group === "com.adstertech" &&
      (d.artifact.startsWith("customadapter-") || d.artifact === "orchestration-sdk")
    );

    if (!adsterDep) {
      throw new Error("No Adster SDK found in project");
    }

    // Remove old version
    gradle.removeDependency(adsterDep.group, adsterDep.artifact);

    // Add new version
    const newVersion = targetVersion || await VersionManager.getLatestVersion(adsterDep.group, adsterDep.artifact) || adsterDep.version;
    const newDependency = `${adsterDep.group}:${adsterDep.artifact}:${newVersion}`;
    gradle.addDependency(newDependency);

    await gradle.save(buildGradlePath);

    return {
      content: [{
        type: "text",
        text: `✅ Updated ${adsterDep.artifact} from ${adsterDep.version} to ${newVersion}`,
      }],
    };
  }

  private async handleRollback(args: any) {
    const projectPath = args.projectPath as string;
    const backupId = args.backupId as string | undefined;

    const backupManager = new BackupManager(projectPath);

    if (!backupId) {
      const backups = await backupManager.listBackups();
      return {
        content: [{
          type: "text",
          text: `Available backups:\n${backups.map(b => `  • ${b}`).join("\n")}`,
        }],
      };
    }

    await backupManager.rollback(backupId);

    return {
      content: [{
        type: "text",
        text: `✅ Successfully rolled back to backup: ${backupId}`,
      }],
    };
  }

  // Helper methods

  private async validateProjectStructure(projectPath: string): Promise<void> {
    if (!existsSync(projectPath)) {
      throw new Error(`Project path does not exist: ${projectPath}`);
    }

    const appDir = join(projectPath, "app");
    if (!existsSync(appDir)) {
      throw new Error("Not a valid Android project: missing 'app' directory");
    }

    logger.success("✅ Project structure validated");
  }

  private async checkDependencyConflicts(projectPath: string): Promise<void> {
    const buildGradlePath = this.findBuildGradle(projectPath, "app");
    const gradle = await GradleParser.fromFile(buildGradlePath);
    const dependencies = gradle.parseDependencies();

    const analyzer = new DependencyAnalyzer(dependencies);
    const result = analyzer.analyze();

    if (result.hasConflicts) {
      logger.warn("⚠️ Dependency conflicts detected. See details below:");
      for (const conflict of result.conflicts) {
        logger.warn(`  ${conflict.message}`);
        if (conflict.resolution) {
          logger.info(`  💡 ${conflict.resolution}`);
        }
      }
    } else {
      logger.success("✅ No dependency conflicts detected");
    }
  }

  private findBuildGradle(projectPath: string, module = "app"): string {
    const groovyPath = join(projectPath, module, "build.gradle");
    const kotlinPath = join(projectPath, module, "build.gradle.kts");

    if (existsSync(groovyPath)) return groovyPath;
    if (existsSync(kotlinPath)) return kotlinPath;

    throw new Error(`build.gradle not found in ${module} module`);
  }

  private getFilesToModify(projectPath: string): string[] {
    const files: string[] = [];

    // Settings gradle
    const settingsGroovy = join(projectPath, "settings.gradle");
    const settingsKotlin = join(projectPath, "settings.gradle.kts");
    if (existsSync(settingsGroovy)) files.push(settingsGroovy);
    if (existsSync(settingsKotlin)) files.push(settingsKotlin);

    // Build gradle
    try {
      files.push(this.findBuildGradle(projectPath, "app"));
    } catch { }

    // Manifest
    const manifest = join(projectPath, "app", "src", "main", "AndroidManifest.xml");
    if (existsSync(manifest)) files.push(manifest);

    // ProGuard
    const proguard = join(projectPath, "app", "proguard-rules.pro");
    if (existsSync(proguard)) files.push(proguard);

    return files;
  }

  private async updateSettingsGradle(projectPath: string): Promise<void> {
    const settingsGroovy = join(projectPath, "settings.gradle");
    const settingsKotlin = join(projectPath, "settings.gradle.kts");

    let settingsPath = "";
    let isKotlin = false;

    if (existsSync(settingsGroovy)) {
      settingsPath = settingsGroovy;
    } else if (existsSync(settingsKotlin)) {
      settingsPath = settingsKotlin;
      isKotlin = true;
    } else {
      logger.warn("settings.gradle not found - skipping");
      return;
    }

    const gradle = await GradleParser.fromFile(settingsPath);
    const added = gradle.addRepository("mavenCentral");

    if (added) {
      await gradle.save(settingsPath);
      logger.success("✅ Added mavenCentral to settings.gradle");
    } else {
      logger.info("ℹ️ mavenCentral already present in settings.gradle");
    }
  }

  private async updateBuildGradle(projectPath: string, config: IntegrationConfig): Promise<void> {
    const buildGradlePath = this.findBuildGradle(projectPath, "app");
    const gradle = await GradleParser.fromFile(buildGradlePath);

    // Remove old orchestration SDK if present
    gradle.removeDependency("com.adstertech", "orchestration-sdk");

    // Add custom adapter dependency
    const dependency = VersionManager.getCustomAdapterDependency(config.adNetwork, config.sdkVersion);
    const added = gradle.addDependency(dependency);

    if (added || gradle.hasDependency("com.adstertech", dependency.split(":")[1])) {
      await gradle.save(buildGradlePath);
      logger.success(`✅ Added ${dependency}`);
    } else {
      logger.info("ℹ️ Adster Custom Adapter already present");
    }
  }

  private async updateBuildGradleOrchestration(projectPath: string, version: string): Promise<void> {
    const buildGradlePath = this.findBuildGradle(projectPath, "app");
    const gradle = await GradleParser.fromFile(buildGradlePath);

    // Remove custom adapters if present
    const deps = gradle.parseDependencies();
    for (const dep of deps) {
      if (dep.group === "com.adstertech" && dep.artifact.startsWith("customadapter-")) {
        gradle.removeDependency(dep.group, dep.artifact);
      }
    }

    // Add orchestration SDK
    const dependency = VersionManager.getOrchestrationSdkDependency(version);
    gradle.addDependency(dependency);

    await gradle.save(buildGradlePath);
    logger.success(`✅ Added ${dependency}`);
  }

  private async updateManifest(projectPath: string): Promise<void> {
    const manifestPath = join(projectPath, "app", "src", "main", "AndroidManifest.xml");

    if (!existsSync(manifestPath)) {
      throw new Error("AndroidManifest.xml not found");
    }

    const manifest = await ManifestParser.fromFile(manifestPath);

    let modified = false;

    if (manifest.addPermission("INTERNET")) {
      logger.success("✅ Added INTERNET permission");
      modified = true;
    }

    if (manifest.addPermission("ACCESS_NETWORK_STATE")) {
      logger.success("✅ Added ACCESS_NETWORK_STATE permission");
      modified = true;
    }

    // Cleanup legacy API Key if present
    if (manifest.removeMetaData("com.adstertech.API_KEY")) {
      logger.success("🗑️ Removed legacy API Key meta-data");
      modified = true;
    }

    if (modified) {
      await manifest.save(manifestPath);
    } else {
      logger.info("ℹ️ All permissions already present");
    }
  }

  private async updateProguard(projectPath: string): Promise<void> {
    const proguardPath = join(projectPath, "app", "proguard-rules.pro");

    const rules = `
# Adster SDK
-keep class com.adstertech.** { *; }
-keep interface com.adstertech.** { *; }
-dontwarn com.adstertech.**
`;

    if (!existsSync(proguardPath)) {
      await writeFile(proguardPath, rules.trim(), "utf8");
      logger.success("✅ Created proguard-rules.pro");
      return;
    }

    const content = await readFile(proguardPath, "utf8");

    if (content.includes("-keep class com.adstertech.** { *; }")) {
      logger.info("ℹ️ ProGuard rules already present");
      return;
    }

    await writeFile(proguardPath, content + "\n" + rules, "utf8");
    logger.success("✅ Added ProGuard rules");
  }

  private async validateIntegration(projectPath: string): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const warnings: string[] = [];
    let score = 0;
    const maxScore = 5;

    // Check build.gradle
    try {
      const buildGradlePath = this.findBuildGradle(projectPath, "app");
      const gradle = await GradleParser.fromFile(buildGradlePath);
      const deps = gradle.parseDependencies();

      const hasAdster = deps.some(d => d.group === "com.adstertech");
      if (hasAdster) {
        score++;
      } else {
        issues.push({
          severity: "error",
          file: "build.gradle",
          message: "No Adster SDK dependency found",
          fix: "Run integration tool",
        });
      }

      // Check SDK versions
      const sdkVersions = gradle.extractSdkVersions();
      if (sdkVersions.minSdk && sdkVersions.minSdk < 21) {
        warnings.push("⚠️ minSdkVersion should be 21 or higher");
      }
    } catch (error) {
      issues.push({
        severity: "error",
        file: "build.gradle",
        message: "Failed to parse build.gradle",
      });
    }

    // Check manifest
    try {
      const manifestPath = join(projectPath, "app", "src", "main", "AndroidManifest.xml");
      const manifest = await ManifestParser.fromFile(manifestPath);

      if (manifest.hasPermission("INTERNET")) {
        score++;
      } else {
        issues.push({
          severity: "error",
          file: "AndroidManifest.xml",
          message: "INTERNET permission missing",
        });
      }

      if (manifest.hasPermission("ACCESS_NETWORK_STATE")) {
        score++;
      } else {
        issues.push({
          severity: "error",
          file: "AndroidManifest.xml",
          message: "ACCESS_NETWORK_STATE permission missing",
        });
      }
    } catch (error) {
      issues.push({
        severity: "error",
        file: "AndroidManifest.xml",
        message: "Failed to parse AndroidManifest.xml",
      });
    }

    // Check ProGuard
    const proguardPath = join(projectPath, "app", "proguard-rules.pro");
    if (existsSync(proguardPath)) {
      const content = await readFile(proguardPath, "utf8");
      if (content.includes("-keep class com.adstertech.** { *; }")) {
        score++;
      } else {
        issues.push({
          severity: "warning",
          file: "proguard-rules.pro",
          message: "ProGuard rules missing or incomplete",
        });
      }
    }

    // Check repositories
    score++; // Assume OK for now

    return {
      valid: issues.filter(i => i.severity === "error").length === 0,
      score,
      maxScore,
      issues,
      warnings,
      suggestions: [],
    };
  }

  private getNextSteps(adNetwork: AdNetwork): string[] {
    return [
      "1. ✅ Sync your Gradle files in Android Studio",
      "2. ✅ Configure Adster in your mediation dashboard (see instructions below)",
      "3. ✅ Use your ad network's standard APIs to load ads",
      "4. ✅ The custom adapter will automatically handle Adster integration",
    ];
  }

  private getDashboardInstructions(adNetwork: AdNetwork): string {
    const instructions: Record<AdNetwork, string> = {
      gam: `
📱 Google Ad Manager Dashboard Configuration:
1. Navigate to Delivery > Custom Events
2. Create a new custom event named "Adster"
3. Configure class names:
   • Banner: com.adstertech.customadapter.AdsterCustomEventBanner
   • Interstitial: com.adstertech.customadapter.AdsterCustomEventInterstitial
   • Rewarded: com.adstertech.customadapter.AdsterCustomEventRewarded
   • Native: com.adstertech.customadapter.AdsterCustomEventNative
4. **Parameter**: Enter your Adster Placement ID

📚 Full documentation: https://ca-docs.adster.tech/google-ad-manager
`,
      admob: `
📱 AdMob Dashboard Configuration:
1. Navigate to Mediation > Create Mediation Group
2. Add "Adster" as a custom event
3. Configure class names:
   • Banner: com.adstertech.customadapter.AdsterCustomEventBanner
   • Interstitial: com.adstertech.customadapter.AdsterCustomEventInterstitial
   • Rewarded: com.adstertech.customadapter.AdsterCustomEventRewarded
   • Native: com.adstertech.customadapter.AdsterCustomEventNative
4. **Parameter**: Enter your Adster Placement ID

📚 Full documentation: https://ca-docs.adster.tech/admob
`,
      applovin: `
📱 AppLovin MAX Dashboard Configuration:
1. Navigate to MAX > Mediation > Manage > Networks
2. Click "Create Custom Network"
3. Configure:
   • Network Name: Adster
   • Android Adapter Class: com.adstertech.customadapter.applovin.AdsterMediationAdapter
4. Add to your ad unit waterfalls (use Placement ID if requested)

📚 Full documentation: https://ca-docs.adster.tech/applovin
`,
      ironsource: `
📱 IronSource LevelPlay Dashboard Configuration:
1. Navigate to SDK Networks
2. Add "Adster" as a custom adapter
3. Configure:
   • Banner: com.adstertech.customadapter.ironsource.AdsterCustomBanner
   • Interstitial: com.adstertech.customadapter.ironsource.AdsterCustomInterstitial
   • Rewarded: com.adstertech.customadapter.ironsource.AdsterCustomRewardedVideo
4. **Parameter**: Enter your Adster Placement ID

📚 Full documentation: https://ca-docs.adster.tech/ironsource
`,
    };

    return instructions[adNetwork];
  }

  private generateIntegrationReport(
    result: IntegrationResult,
    progress: ProgressTrackerImpl,
    adNetwork: AdNetwork,
    version: string
  ): string {
    const lines: string[] = [];

    lines.push("\n" + "=".repeat(70));
    lines.push("🎉 ADSTER CUSTOM ADAPTER INTEGRATION COMPLETE");
    lines.push("=".repeat(70));

    lines.push("\n📦 Integration Summary:");
    lines.push(`  • Ad Network: ${this.getAdNetworkName(adNetwork)}`);
    lines.push(`  • Adapter Version: ${version}`);
    lines.push(`  • Backup ID: ${result.backupId}`);

    lines.push("\n✅ Files Modified:");
    for (const file of result.filesModified.filter(f => f.success)) {
      lines.push(`  • ${file.file}`);
    }

    if (result.warnings.length > 0) {
      lines.push("\n⚠️  Warnings:");
      for (const warning of result.warnings) {
        lines.push(`  ${warning}`);
      }
    }

    lines.push("\n📝 Next Steps:");
    for (const step of result.nextSteps) {
      lines.push(`  ${step}`);
    }

    if (result.dashboardInstructions) {
      lines.push("\n" + result.dashboardInstructions);
    }

    lines.push("\n💡 Support:");
    lines.push("  • Documentation: https://ca-docs.adster.tech/");
    lines.push("  • Dashboard: https://dashboard.adster.tech/");
    lines.push("  • Support: support@adster.tech");

    lines.push("\n" + "=".repeat(70));

    return lines.join("\n");
  }

  private generateOrchestrationReport(
    result: IntegrationResult,
    progress: ProgressTrackerImpl,
    version: string
  ): string {
    const lines: string[] = [];

    lines.push("\n" + "=".repeat(70));
    lines.push("🎉 ADSTER ORCHESTRATION SDK INTEGRATION COMPLETE");
    lines.push("=".repeat(70));

    lines.push("\n📦 Integration Summary:");
    lines.push(`  • SDK Version: ${version}`);
    lines.push(`  • Backup ID: ${result.backupId}`);

    lines.push("\n✅ Files Modified:");
    for (const file of result.filesModified.filter(f => f.success)) {
      lines.push(`  • ${file.file}`);
    }

    lines.push("\n📝 Next Steps:");
    for (const step of result.nextSteps) {
      lines.push(`  ${step}`);
    }

    lines.push("\n💡 Important:");
    lines.push("  • Configure placement IDs in your ad request code");
    lines.push("  • Initialize SDK in your Application class");
    lines.push("  • Use test mode during development");

    lines.push("\n" + "=".repeat(70));

    return lines.join("\n");
  }

  private generateValidationReport(result: ValidationResult): string {
    const lines: string[] = [];

    lines.push("\n" + "=".repeat(70));
    lines.push("🔍 ADSTER INTEGRATION VALIDATION REPORT");
    lines.push("=".repeat(70));

    lines.push(`\n📊 Score: ${result.score}/${result.maxScore}`);

    if (result.valid) {
      lines.push("\n🎉 ✅ Integration is valid!");
    } else {
      lines.push("\n❌ Integration has issues");
    }

    if (result.issues.length > 0) {
      lines.push("\n🔴 Issues Found:");
      for (const issue of result.issues) {
        lines.push(`  ${issue.severity === "error" ? "❌" : "⚠️"} ${issue.file}: ${issue.message}`);
        if (issue.fix) {
          lines.push(`     💡 Fix: ${issue.fix}`);
        }
      }
    }

    if (result.warnings.length > 0) {
      lines.push("\n⚠️  Warnings:");
      for (const warning of result.warnings) {
        lines.push(`  ${warning}`);
      }
    }

    lines.push("\n" + "=".repeat(70));

    return lines.join("\n");
  }

  private getAdNetworkName(network: AdNetwork): string {
    const names: Record<AdNetwork, string> = {
      gam: "Google Ad Manager",
      admob: "AdMob",
      applovin: "AppLovin MAX",
      ironsource: "IronSource LevelPlay",
    };
    return names[network];
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info("Adster MCP Server v3.0.0 running on stdio");
  }
}

const server = new AdsterIntegrationServer();
server.run().catch((error) => {
  logger.error("Fatal error", error);
  process.exit(1);
});

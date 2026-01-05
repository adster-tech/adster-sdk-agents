import { DependencyInfo, DependencyConflict, ConflictDetectionResult } from "./types.js";
import { logger } from "./logger.js";
import { VersionManager } from "./version-manager.js";

/**
 * Dependency analyzer for conflict detection and recommendations
 */
export class DependencyAnalyzer {
    private dependencies: DependencyInfo[];

    constructor(dependencies: DependencyInfo[]) {
        this.dependencies = dependencies;
    }

    /**
     * Analyze dependencies for conflicts
     */
    analyze(): ConflictDetectionResult {
        const conflicts: DependencyConflict[] = [];
        const warnings: string[] = [];

        // Check for duplicate dependencies with different versions
        conflicts.push(...this.detectVersionConflicts());

        // Check for incompatible ad SDKs
        conflicts.push(...this.detectIncompatibleSdks());

        // Check for old Adster SDK versions
        warnings.push(...this.detectOldAdsterVersions());

        // Check for missing required dependencies
        warnings.push(...this.detectMissingDependencies());

        return {
            hasConflicts: conflicts.length > 0,
            conflicts,
            warnings,
        };
    }

    /**
     * Detect version conflicts for the same dependency
     */
    private detectVersionConflicts(): DependencyConflict[] {
        const conflicts: DependencyConflict[] = [];
        const grouped = new Map<string, DependencyInfo[]>();

        // Group dependencies by group:artifact
        for (const dep of this.dependencies) {
            const key = `${dep.group}:${dep.artifact}`;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(dep);
        }

        // Check for multiple versions
        for (const [key, deps] of grouped.entries()) {
            if (deps.length > 1) {
                const versions = new Set(deps.map((d) => d.version));
                if (versions.size > 1) {
                    conflicts.push({
                        type: "version",
                        dependency: deps[0],
                        conflictWith: deps[1],
                        message: `Multiple versions of ${key} found: ${Array.from(versions).join(", ")}`,
                        resolution: `Keep only one version, preferably the latest: ${this.getLatestVersion(Array.from(versions))}`,
                    });
                }
            }
        }

        return conflicts;
    }

    /**
     * Detect duplicate Adster Custom Adapter dependencies
     */
    private detectIncompatibleSdks(): DependencyConflict[] {
        const conflicts: DependencyConflict[] = [];

        // Check for multiple Adster custom adapters
        const adsterAdapters = this.dependencies.filter(
            (dep) => dep.group === "com.adstertech" && dep.artifact.startsWith("customadapter-")
        );

        if (adsterAdapters.length > 1) {
            conflicts.push({
                type: "duplicate",
                dependency: adsterAdapters[0],
                conflictWith: adsterAdapters[1],
                message: `Multiple Adster Custom Adapters detected. You should only have one adapter for your mediation platform.`,
                resolution: `Remove ${adsterAdapters.slice(1).map(d => `${d.group}:${d.artifact}`).join(", ")}`,
            });
        }

        // Check for both orchestration SDK and custom adapter
        const hasOrchestrationSdk = this.dependencies.some(
            (dep) => dep.group === "com.adstertech" && dep.artifact === "orchestration-sdk"
        );
        const hasCustomAdapter = this.dependencies.some(
            (dep) => dep.group === "com.adstertech" && dep.artifact.startsWith("customadapter-")
        );

        if (hasOrchestrationSdk && hasCustomAdapter) {
            conflicts.push({
                type: "incompatible",
                dependency: this.dependencies.find((d) => d.artifact === "orchestration-sdk")!,
                conflictWith: this.dependencies.find((d) => d.artifact.startsWith("customadapter-"))!,
                message: `Both Adster Orchestration SDK and Custom Adapter detected. These should not be used together.`,
                resolution: `For mediation setups, use only Custom Adapter. For direct integration, use only Orchestration SDK.`,
            });
        }

        return conflicts;
    }

    /**
     * Detect old Adster SDK versions
     */
    private detectOldAdsterVersions(): string[] {
        const warnings: string[] = [];

        const adsterDeps = this.dependencies.filter(
            (dep) => dep.group === "com.adstertech"
        );

        for (const dep of adsterDeps) {
            // Check custom adapter versions
            if (dep.artifact === "customadapter-lite") {
                const currentDefault = VersionManager.VERSION_CONFIG.customAdapter.lite.defaultVersion;
                if (dep.version !== currentDefault && dep.version !== "+") {
                    warnings.push(
                        `⚠️ Adster Custom Adapter Lite version ${dep.version} may be outdated. Current recommended version: ${currentDefault}`
                    );
                }
            } else if (dep.artifact === "customadapter-applovin") {
                const currentDefault = VersionManager.VERSION_CONFIG.customAdapter.applovin.defaultVersion;
                if (dep.version !== currentDefault && dep.version !== "+") {
                    warnings.push(
                        `⚠️ Adster Custom Adapter AppLovin version ${dep.version} may be outdated. Current recommended version: ${currentDefault}`
                    );
                }
            } else if (dep.artifact === "customadapter-ironsource") {
                const currentDefault = VersionManager.VERSION_CONFIG.customAdapter.ironsource.defaultVersion;
                if (dep.version !== currentDefault && dep.version !== "+") {
                    warnings.push(
                        `⚠️ Adster Custom Adapter IronSource version ${dep.version} may be outdated. Current recommended version: ${currentDefault}`
                    );
                }
            }
        }

        return warnings;
    }

    /**
     * Detect missing required dependencies
     */
    private detectMissingDependencies(): string[] {
        const warnings: string[] = [];

        // Check if custom adapter exists but no mediation SDK
        const hasCustomAdapter = this.dependencies.some(
            (dep) => dep.group === "com.adstertech" && dep.artifact.startsWith("customadapter-")
        );

        if (hasCustomAdapter) {
            const hasGoogleAds = this.dependencies.some(
                (dep) => dep.group === "com.google.android.gms" && dep.artifact === "play-services-ads"
            );
            const hasAppLovin = this.dependencies.some(
                (dep) => dep.group === "com.applovin" && dep.artifact === "applovin-sdk"
            );
            const hasIronSource = this.dependencies.some(
                (dep) => dep.group === "com.ironsource.sdk" && dep.artifact === "mediationsdk"
            );

            if (!hasGoogleAds && !hasAppLovin && !hasIronSource) {
                warnings.push(
                    `⚠️ Adster Custom Adapter detected but no mediation SDK found. Make sure you have the appropriate mediation SDK dependency.`
                );
            }
        }

        return warnings;
    }

    /**
     * Get latest version from a set of versions (simple semver comparison)
     */
    private getLatestVersion(versions: string[]): string {
        return versions.sort((a, b) => {
            const aParts = a.split(".").map((n) => parseInt(n, 10) || 0);
            const bParts = b.split(".").map((n) => parseInt(n, 10) || 0);

            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                const aPart = aParts[i] || 0;
                const bPart = bParts[i] || 0;
                if (aPart !== bPart) {
                    return aPart - bPart;
                }
            }
            return 0;
        })[versions.length - 1];
    }

    /**
     * Generate analysis report
     */
    generateReport(): string {
        const result = this.analyze();
        const lines: string[] = [];

        lines.push("\n📊 Dependency Analysis Report");
        lines.push("=".repeat(60));

        if (result.hasConflicts) {
            lines.push("\n❌ Conflicts Detected:");
            for (const conflict of result.conflicts) {
                lines.push(`\n  🔴 ${conflict.type.toUpperCase()}: ${conflict.message}`);
                if (conflict.resolution) {
                    lines.push(`     💡 Resolution: ${conflict.resolution}`);
                }
            }
        } else {
            lines.push("\n✅ No conflicts detected");
        }

        if (result.warnings.length > 0) {
            lines.push("\n⚠️  Warnings:");
            for (const warning of result.warnings) {
                lines.push(`  ${warning}`);
            }
        }

        lines.push("\n" + "=".repeat(60));
        return lines.join("\n");
    }
}

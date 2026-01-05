import axios from "axios";
import { MavenArtifactInfo, VersionInfo, AdNetwork } from "./types.js";
import { logger } from "./logger.js";

/**
 * Version configuration and management
 */
export class VersionManager {
    public static readonly VERSION_CONFIG = {
        customAdapter: {
            lite: {
                group: "com.adstertech",
                artifact: "customadapter-lite",
                defaultVersion: "2.2.1",
                networks: ["gam", "admob"] as AdNetwork[],
            },
            applovin: {
                group: "com.adstertech",
                artifact: "customadapter-applovin",
                defaultVersion: "2.1.4",
                networks: ["applovin"] as AdNetwork[],
            },
            ironsource: {
                group: "com.adstertech",
                artifact: "customadapter-ironsource",
                defaultVersion: "2.1.4",
                networks: ["ironsource"] as AdNetwork[],
            },
        },
        orchestrationSdk: {
            group: "com.adstertech",
            artifact: "orchestration-sdk",
            defaultVersion: "latest",
        },
    };

    static getAdapterForNetwork(network: AdNetwork): "lite" | "applovin" | "ironsource" {
        if (network === "gam" || network === "admob") {
            return "lite";
        } else if (network === "applovin") {
            return "applovin";
        } else {
            return "ironsource";
        }
    }

    static getDefaultVersion(network: AdNetwork): string {
        const adapter = this.getAdapterForNetwork(network);
        return this.VERSION_CONFIG.customAdapter[adapter].defaultVersion;
    }

    static getCustomAdapterDependency(network: AdNetwork, version?: string): string {
        const adapter = this.getAdapterForNetwork(network);
        const config = this.VERSION_CONFIG.customAdapter[adapter];
        const targetVersion = version || config.defaultVersion;
        return `${config.group}:${config.artifact}:${targetVersion}`;
    }

    static getOrchestrationSdkDependency(version?: string): string {
        const config = this.VERSION_CONFIG.orchestrationSdk;
        const targetVersion = version || config.defaultVersion;
        return `${config.group}:${config.artifact}:${targetVersion === "latest" ? "+" : targetVersion}`;
    }

    /**
     * Check if a version exists on Maven Central
     */
    static async checkVersionExists(
        group: string,
        artifact: string,
        version: string
    ): Promise<boolean> {
        try {
            const url = `https://repo1.maven.org/maven2/${group.replace(
                /\./g,
                "/"
            )}/${artifact}/${version}/${artifact}-${version}.pom`;

            logger.debug(`Checking version: ${url}`);
            const response = await axios.head(url, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            logger.debug(`Version check failed for ${group}:${artifact}:${version}`);
            return false;
        }
    }

    /**
     * Fetch available versions from Maven Central
     */
    static async fetchAvailableVersions(
        group: string,
        artifact: string
    ): Promise<MavenArtifactInfo | null> {
        try {
            const url = `https://repo1.maven.org/maven2/${group.replace(
                /\./g,
                "/"
            )}/${artifact}/maven-metadata.xml`;

            logger.debug(`Fetching versions: ${url}`);
            const response = await axios.get(url, { timeout: 5000 });

            // Parse XML (simple parsing for maven-metadata.xml)
            const versionsMatch = response.data.match(
                /<versions>([\s\S]*?)<\/versions>/
            );
            const latestMatch = response.data.match(/<latest>(.*?)<\/latest>/);

            if (!versionsMatch) {
                return null;
            }

            const versionTags = versionsMatch[1].match(/<version>(.*?)<\/version>/g) || [];
            const versions: VersionInfo[] = versionTags.map((tag: string) => {
                const version = tag.replace(/<\/?version>/g, "");
                return {
                    version,
                    isLatest: version === (latestMatch?.[1] || ""),
                    isStable: !version.includes("-") && !version.includes("alpha") && !version.includes("beta"),
                };
            });

            return {
                group,
                artifact,
                latestVersion: latestMatch?.[1] || versions[versions.length - 1]?.version || "unknown",
                versions,
            };
        } catch (error) {
            logger.debug(`Failed to fetch versions for ${group}:${artifact}`);
            return null;
        }
    }

    /**
     * Get the latest stable version
     */
    static async getLatestVersion(
        group: string,
        artifact: string
    ): Promise<string | null> {
        const info = await this.fetchAvailableVersions(group, artifact);
        if (!info) return null;

        const stableVersions = info.versions.filter((v) => v.isStable);
        return stableVersions.length > 0
            ? stableVersions[stableVersions.length - 1].version
            : info.latestVersion;
    }

    /**
     * Validate and get recommended version
     */
    static async validateVersion(
        network: AdNetwork,
        requestedVersion?: string
    ): Promise<{ version: string; isValid: boolean; message: string }> {
        const adapter = this.getAdapterForNetwork(network);
        const config = this.VERSION_CONFIG.customAdapter[adapter];

        // If no version requested, use default
        if (!requestedVersion) {
            return {
                version: config.defaultVersion,
                isValid: true,
                message: `Using default version: ${config.defaultVersion}`,
            };
        }

        // Check if requested version exists
        const exists = await this.checkVersionExists(
            config.group,
            config.artifact,
            requestedVersion
        );

        if (!exists) {
            logger.warn(`Version ${requestedVersion} not found, falling back to ${config.defaultVersion}`);
            return {
                version: config.defaultVersion,
                isValid: false,
                message: `Version ${requestedVersion} not found on Maven Central. Using ${config.defaultVersion} instead.`,
            };
        }

        // Check if there's a newer version available
        const latestVersion = await this.getLatestVersion(config.group, config.artifact);
        if (latestVersion && latestVersion !== requestedVersion) {
            logger.info(`Newer version available: ${latestVersion} (requested: ${requestedVersion})`);
        }

        return {
            version: requestedVersion,
            isValid: true,
            message: `Using version: ${requestedVersion}`,
        };
    }
}

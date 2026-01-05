import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { DependencyInfo } from "./types.js";
import { logger } from "./logger.js";

/**
 * Gradle file parser and modifier
 * Handles both Groovy (.gradle) and Kotlin DSL (.gradle.kts)
 */
export class GradleParser {
    private content: string;
    private isKotlin: boolean;

    constructor(content: string, isKotlin: boolean) {
        this.content = content;
        this.isKotlin = isKotlin;
    }

    static async fromFile(filePath: string): Promise<GradleParser> {
        if (!existsSync(filePath)) {
            throw new Error(`Gradle file not found: ${filePath}`);
        }

        const content = await readFile(filePath, "utf8");
        const isKotlin = filePath.endsWith(".kts");
        return new GradleParser(content, isKotlin);
    }

    /**
     * Parse dependencies from Gradle file
     */
    parseDependencies(): DependencyInfo[] {
        const dependencies: DependencyInfo[] = [];

        // Match implementation/api/compileOnly dependencies
        const dependencyPattern = this.isKotlin
            ? /(?:implementation|api|compileOnly)\s*\(\s*["']([^"']+)["']\s*\)/g
            : /(?:implementation|api|compileOnly)\s+["']([^"']+)["']/g;

        let match;
        while ((match = dependencyPattern.exec(this.content)) !== null) {
            const depString = match[1];
            const parts = depString.split(":");

            if (parts.length >= 2) {
                dependencies.push({
                    group: parts[0],
                    artifact: parts[1],
                    version: parts[2] || "unspecified",
                    scope: this.extractScope(match[0]),
                });
            }
        }

        return dependencies;
    }

    private extractScope(declaration: string): string {
        if (declaration.includes("implementation")) return "implementation";
        if (declaration.includes("api")) return "api";
        if (declaration.includes("compileOnly")) return "compileOnly";
        return "unknown";
    }

    /**
     * Check if dependency already exists
     */
    hasDependency(group: string, artifact: string): boolean {
        const dependencies = this.parseDependencies();
        return dependencies.some(
            (dep) => dep.group === group && dep.artifact === artifact
        );
    }

    /**
     * Add dependency to dependencies block
     */
    addDependency(dependency: string, scope = "implementation"): boolean {
        // Check if dependency already exists
        const depParts = dependency.split(":");
        if (depParts.length >= 2 && this.hasDependency(depParts[0], depParts[1])) {
            logger.warn(`Dependency already exists: ${dependency}`);
            return false;
        }

        const dependencyLine = this.isKotlin
            ? `    ${scope}("${dependency}")`
            : `    ${scope} '${dependency}'`;

        // Find dependencies block
        const dependenciesPattern = /dependencies\s*\{/;
        const match = dependenciesPattern.exec(this.content);

        if (!match) {
            logger.error("Could not find dependencies block in Gradle file");
            return false;
        }

        // Insert dependency after dependencies block opening
        const insertPosition = match.index + match[0].length;
        this.content =
            this.content.slice(0, insertPosition) +
            "\n" +
            dependencyLine +
            this.content.slice(insertPosition);

        logger.debug(`Added dependency: ${dependency}`);
        return true;
    }

    /**
     * Remove dependency
     */
    removeDependency(group: string, artifact: string): boolean {
        const pattern = this.isKotlin
            ? new RegExp(
                `\\s*(?:implementation|api|compileOnly)\\s*\\(\\s*["']${group}:${artifact}[^"']*["']\\s*\\)\\s*`,
                "g"
            )
            : new RegExp(
                `\\s*(?:implementation|api|compileOnly)\\s+["']${group}:${artifact}[^"']*["']\\s*`,
                "g"
            );

        const originalContent = this.content;
        this.content = this.content.replace(pattern, "\n");

        if (this.content !== originalContent) {
            logger.debug(`Removed dependency: ${group}:${artifact}`);
            return true;
        }

        return false;
    }

    /**
     * Add repository to repositories block
     */
    addRepository(repository: string): boolean {
        // Check if repository already exists
        if (this.content.includes(repository + "()")) {
            logger.debug(`Repository already exists: ${repository}`);
            return false;
        }

        // Find repositories block
        const repositoriesPattern = /repositories\s*\{/;
        const match = repositoriesPattern.exec(this.content);

        if (!match) {
            // Try to find allprojects block
            const allProjectsPattern = /allprojects\s*\{/;
            const allProjectsMatch = allProjectsPattern.exec(this.content);

            if (allProjectsMatch) {
                // Add repositories block inside allprojects
                const insertPosition = allProjectsMatch.index + allProjectsMatch[0].length;
                const repositoriesBlock = `\n    repositories {\n        ${repository}()\n    }`;
                this.content =
                    this.content.slice(0, insertPosition) +
                    repositoriesBlock +
                    this.content.slice(insertPosition);
                logger.debug(`Added repositories block with ${repository}`);
                return true;
            }

            logger.warn("Could not find repositories or allprojects block");
            return false;
        }

        // Insert repository after repositories block opening
        const insertPosition = match.index + match[0].length;
        this.content =
            this.content.slice(0, insertPosition) +
            `\n        ${repository}()` +
            this.content.slice(insertPosition);

        logger.debug(`Added repository: ${repository}`);
        return true;
    }

    /**
     * Get the modified content
     */
    getContent(): string {
        return this.content;
    }

    /**
     * Save to file
     */
    async save(filePath: string): Promise<void> {
        await writeFile(filePath, this.content, "utf8");
        logger.debug(`Saved Gradle file: ${filePath}`);
    }

    /**
     * Extract Android SDK versions
     */
    extractSdkVersions(): {
        minSdk?: number;
        targetSdk?: number;
        compileSdk?: number;
    } {
        const minSdkMatch = this.content.match(/minSdk(?:Version)?\s*[=:]\s*(\d+)/);
        const targetSdkMatch = this.content.match(/targetSdk(?:Version)?\s*[=:]\s*(\d+)/);
        const compileSdkMatch = this.content.match(/compileSdk(?:Version)?\s*[=:]\s*(\d+)/);

        return {
            minSdk: minSdkMatch ? parseInt(minSdkMatch[1], 10) : undefined,
            targetSdk: targetSdkMatch ? parseInt(targetSdkMatch[1], 10) : undefined,
            compileSdk: compileSdkMatch ? parseInt(compileSdkMatch[1], 10) : undefined,
        };
    }
}

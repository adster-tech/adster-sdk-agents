import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { logger } from "./logger.js";

/**
 * AndroidManifest.xml parser and modifier using proper XML parsing
 */
export class ManifestParser {
    private parsedXml: any;
    private parser: XMLParser;
    private builder: XMLBuilder;

    constructor(content: string) {
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            format: true,
            indentBy: "    ",
            suppressEmptyNode: true,
        };

        this.parser = new XMLParser(options);
        this.builder = new XMLBuilder(options);
        this.parsedXml = this.parser.parse(content);
    }

    static async fromFile(filePath: string): Promise<ManifestParser> {
        if (!existsSync(filePath)) {
            throw new Error(`Manifest file not found: ${filePath}`);
        }

        const content = await readFile(filePath, "utf8");
        return new ManifestParser(content);
    }

    /**
     * Check if permission exists
     */
    hasPermission(permission: string): boolean {
        const manifest = this.parsedXml?.manifest;
        if (!manifest) return false;

        const permissions = manifest["uses-permission"];
        if (!permissions) return false;

        const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
        return permissionArray.some(
            (p) => p["@_android:name"] === permission || p["@_android:name"] === `android.permission.${permission}`
        );
    }

    /**
     * Add permission if it doesn't exist
     */
    addPermission(permission: string): boolean {
        const fullPermission = permission.startsWith("android.permission.")
            ? permission
            : `android.permission.${permission}`;

        if (this.hasPermission(fullPermission)) {
            logger.debug(`Permission already exists: ${fullPermission}`);
            return false;
        }

        const manifest = this.parsedXml?.manifest;
        if (!manifest) {
            throw new Error("Invalid manifest structure");
        }

        // Initialize uses-permission array if it doesn't exist
        if (!manifest["uses-permission"]) {
            manifest["uses-permission"] = [];
        }

        // Ensure it's an array
        if (!Array.isArray(manifest["uses-permission"])) {
            manifest["uses-permission"] = [manifest["uses-permission"]];
        }

        // Add new permission
        manifest["uses-permission"].push({
            "@_android:name": fullPermission,
        });

        logger.debug(`Added permission: ${fullPermission}`);
        return true;
    }

    /**
     * Check if meta-data exists
     */
    hasMetaData(name: string): boolean {
        const manifest = this.parsedXml?.manifest;
        if (!manifest?.application) return false;

        const metaData = manifest.application["meta-data"];
        if (!metaData) return false;

        const metaDataArray = Array.isArray(metaData) ? metaData : [metaData];
        return metaDataArray.some((m) => m["@_android:name"] === name);
    }

    /**
     * Add or update meta-data
     */
    setMetaData(name: string, value: string): boolean {
        const manifest = this.parsedXml?.manifest;
        if (!manifest?.application) {
            throw new Error("Invalid manifest structure: missing application tag");
        }

        // Check if meta-data already exists
        const existingIndex = this.getMetaDataIndex(name);

        const metaDataEntry = {
            "@_android:name": name,
            "@_android:value": value,
        };

        if (existingIndex !== -1) {
            // Update existing
            if (Array.isArray(manifest.application["meta-data"])) {
                manifest.application["meta-data"][existingIndex] = metaDataEntry;
            } else {
                manifest.application["meta-data"] = metaDataEntry;
            }
            logger.debug(`Updated meta-data: ${name} = ${value}`);
            return true;
        }

        // Add new meta-data
        if (!manifest.application["meta-data"]) {
            manifest.application["meta-data"] = [];
        }

        if (!Array.isArray(manifest.application["meta-data"])) {
            manifest.application["meta-data"] = [manifest.application["meta-data"]];
        }

        manifest.application["meta-data"].push(metaDataEntry);
        logger.debug(`Added meta-data: ${name} = ${value}`);
        return true;
    }

    /**
     * Remove meta-data
     */
    removeMetaData(name: string): boolean {
        const manifest = this.parsedXml?.manifest;
        if (!manifest?.application?.["meta-data"]) {
            return false;
        }

        const metaData = manifest.application["meta-data"];

        if (Array.isArray(metaData)) {
            const filtered = metaData.filter((m) => m["@_android:name"] !== name);
            if (filtered.length < metaData.length) {
                manifest.application["meta-data"] = filtered;
                logger.debug(`Removed meta-data: ${name}`);
                return true;
            }
        } else if (metaData["@_android:name"] === name) {
            delete manifest.application["meta-data"];
            logger.debug(`Removed meta-data: ${name}`);
            return true;
        }

        return false;
    }

    private getMetaDataIndex(name: string): number {
        const manifest = this.parsedXml?.manifest;
        if (!manifest?.application?.["meta-data"]) {
            return -1;
        }

        const metaData = manifest.application["meta-data"];
        if (!Array.isArray(metaData)) {
            return metaData["@_android:name"] === name ? 0 : -1;
        }

        return metaData.findIndex((m) => m["@_android:name"] === name);
    }

    /**
     * Set application attribute
     */
    setApplicationAttribute(attribute: string, value: string): void {
        const manifest = this.parsedXml?.manifest;
        if (!manifest?.application) {
            throw new Error("Invalid manifest structure: missing application tag");
        }

        const attrName = attribute.startsWith("@_") ? attribute : `@_android:${attribute}`;
        manifest.application[attrName] = value;
        logger.debug(`Set application attribute: ${attribute} = ${value}`);
    }

    /**
     * Get the modified XML content
     */
    getContent(): string {
        let xml = this.builder.build(this.parsedXml);

        // Add XML declaration if missing
        if (!xml.startsWith("<?xml")) {
            xml = '<?xml version="1.0" encoding="utf-8"?>\n' + xml;
        }

        return xml;
    }

    /**
     * Save to file
     */
    async save(filePath: string): Promise<void> {
        const content = this.getContent();
        await writeFile(filePath, content, "utf8");
        logger.debug(`Saved manifest file: ${filePath}`);
    }

    /**
     * Get package name
     */
    getPackageName(): string | undefined {
        return this.parsedXml?.manifest?.["@_package"];
    }

    /**
     * Get all permissions
     */
    getPermissions(): string[] {
        const manifest = this.parsedXml?.manifest;
        if (!manifest?.["uses-permission"]) return [];

        const permissions = manifest["uses-permission"];
        const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

        return permissionArray.map((p) => p["@_android:name"]).filter(Boolean);
    }
}

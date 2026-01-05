import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { BackupInfo, BackupFile } from "./types.js";
import { logger } from "./logger.js";

/**
 * Backup and rollback utilities for safe file modifications
 */
export class BackupManager {
    private backupDir: string;

    constructor(projectPath: string) {
        this.backupDir = join(projectPath, ".adster-backup");
    }

    async createBackup(files: string[]): Promise<string> {
        const backupId = `backup-${Date.now()}`;
        const backupPath = join(this.backupDir, backupId);

        try {
            // Create backup directory
            if (!existsSync(this.backupDir)) {
                await mkdir(this.backupDir, { recursive: true });
            }
            await mkdir(backupPath, { recursive: true });

            const backupFiles: BackupFile[] = [];

            for (const file of files) {
                if (existsSync(file)) {
                    const content = await readFile(file, "utf8");
                    const relativePath = file.split("/").pop() || "unknown";
                    const backupFilePath = join(backupPath, relativePath);

                    await writeFile(backupFilePath, content, "utf8");

                    backupFiles.push({
                        path: file,
                        content: content,
                    });

                    logger.debug(`Backed up: ${file} -> ${backupFilePath}`);
                }
            }

            // Write backup metadata
            const backupInfo: BackupInfo = {
                timestamp: new Date().toISOString(),
                files: backupFiles,
            };

            await writeFile(
                join(backupPath, "backup-info.json"),
                JSON.stringify(backupInfo, null, 2),
                "utf8"
            );

            logger.success(`✅ Created backup: ${backupId}`);
            return backupId;
        } catch (error) {
            logger.error("Failed to create backup", error as Error);
            throw error;
        }
    }

    async rollback(backupId: string): Promise<void> {
        const backupPath = join(this.backupDir, backupId);

        if (!existsSync(backupPath)) {
            throw new Error(`Backup not found: ${backupId}`);
        }

        try {
            // Read backup metadata
            const backupInfoPath = join(backupPath, "backup-info.json");
            const backupInfoContent = await readFile(backupInfoPath, "utf8");
            const backupInfo: BackupInfo = JSON.parse(backupInfoContent);

            logger.info(`Rolling back to backup: ${backupId}`);

            // Restore each file
            for (const file of backupInfo.files) {
                await writeFile(file.path, file.content, "utf8");
                logger.debug(`Restored: ${file.path}`);
            }

            logger.success(`✅ Rollback completed successfully`);
        } catch (error) {
            logger.error("Failed to rollback", error as Error);
            throw error;
        }
    }

    async listBackups(): Promise<string[]> {
        if (!existsSync(this.backupDir)) {
            return [];
        }

        const fs = await import("fs/promises");
        const entries = await fs.readdir(this.backupDir, { withFileTypes: true });
        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);
    }

    async cleanupOldBackups(keepCount = 5): Promise<void> {
        const backups = await this.listBackups();

        if (backups.length <= keepCount) {
            return;
        }

        // Sort by timestamp (newest first)
        const sortedBackups = backups.sort().reverse();
        const toDelete = sortedBackups.slice(keepCount);

        for (const backup of toDelete) {
            const backupPath = join(this.backupDir, backup);
            const fs = await import("fs/promises");
            await fs.rm(backupPath, { recursive: true, force: true });
            logger.debug(`Deleted old backup: ${backup}`);
        }

        logger.info(`🧹 Cleaned up ${toDelete.length} old backups`);
    }
}

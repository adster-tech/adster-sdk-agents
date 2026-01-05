import { LogLevel } from "./types.js";

/**
 * Logger utility with colored output and progress tracking
 */
export class Logger {
    private prefix: string;
    private verbose: boolean;

    constructor(prefix = "Adster", verbose = true) {
        this.prefix = prefix;
        this.verbose = verbose;
    }

    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString();
        const emoji = this.getEmoji(level);
        return `${emoji} [${timestamp}] [${this.prefix}] [${level.toUpperCase()}] ${message}`;
    }

    private getEmoji(level: LogLevel): string {
        switch (level) {
            case "success": return "✅";
            case "info": return "ℹ️";
            case "warn": return "⚠️";
            case "error": return "❌";
            case "debug": return "🔍";
            default: return "📝";
        }
    }

    info(message: string): void {
        console.error(this.formatMessage("info", message));
    }

    success(message: string): void {
        console.error(this.formatMessage("success", message));
    }

    warn(message: string): void {
        console.error(this.formatMessage("warn", message));
    }

    error(message: string, error?: Error): void {
        const msg = error ? `${message}: ${error.message}` : message;
        console.error(this.formatMessage("error", msg));
        if (error?.stack && this.verbose) {
            console.error(error.stack);
        }
    }

    debug(message: string): void {
        if (this.verbose) {
            console.error(this.formatMessage("debug", message));
        }
    }

    step(step: number, total: number, message: string): void {
        const progress = `[${step}/${total}]`;
        console.error(`\n🚀 ${progress} ${message}`);
    }

    section(title: string): void {
        console.error(`\n${"=".repeat(60)}`);
        console.error(`  ${title}`);
        console.error(`${"=".repeat(60)}\n`);
    }

    result(emoji: string, message: string): void {
        console.error(`${emoji} ${message}`);
    }
}

export const logger = new Logger();

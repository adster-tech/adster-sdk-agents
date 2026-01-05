import { ProgressTracker, IntegrationStep } from "./types.js";
import { logger } from "./logger.js";

/**
 * Progress tracking for integration steps
 */
export class ProgressTrackerImpl implements ProgressTracker {
    totalSteps: number;
    currentStep: number;
    currentStepName: string;
    completed: IntegrationStep[];
    failed: IntegrationStep[];

    constructor(totalSteps: number) {
        this.totalSteps = totalSteps;
        this.currentStep = 0;
        this.currentStepName = "";
        this.completed = [];
        this.failed = [];
    }

    /**
     * Start a new step
     */
    startStep(step: IntegrationStep, description: string): void {
        this.currentStep++;
        this.currentStepName = description;
        logger.step(this.currentStep, this.totalSteps, description);
    }

    /**
     * Mark current step as completed
     */
    completeStep(step: IntegrationStep): void {
        this.completed.push(step);
        logger.success(`✅ Completed: ${this.currentStepName}`);
    }

    /**
     * Mark current step as failed
     */
    failStep(step: IntegrationStep, error: string): void {
        this.failed.push(step);
        logger.error(`❌ Failed: ${this.currentStepName} - ${error}`);
    }

    /**
     * Get progress percentage
     */
    getProgress(): number {
        return Math.round((this.currentStep / this.totalSteps) * 100);
    }

    /**
     * Generate progress summary
     */
    getSummary(): string {
        const lines: string[] = [];

        lines.push("\n📈 Integration Progress Summary");
        lines.push("=".repeat(60));
        lines.push(`Progress: ${this.getProgress()}% (${this.currentStep}/${this.totalSteps} steps)`);
        lines.push(`Completed: ${this.completed.length} steps`);
        lines.push(`Failed: ${this.failed.length} steps`);

        if (this.completed.length > 0) {
            lines.push("\n✅ Completed Steps:");
            for (const step of this.completed) {
                lines.push(`  • ${step}`);
            }
        }

        if (this.failed.length > 0) {
            lines.push("\n❌ Failed Steps:");
            for (const step of this.failed) {
                lines.push(`  • ${step}`);
            }
        }

        lines.push("=".repeat(60));
        return lines.join("\n");
    }

    /**
     * Check if integration is complete
     */
    isComplete(): boolean {
        return this.currentStep >= this.totalSteps;
    }

    /**
     * Check if integration has failures
     */
    hasFailed(): boolean {
        return this.failed.length > 0;
    }
}

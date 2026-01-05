/**
 * Type definitions for Adster SDK MCP Server
 */

export type AdNetwork = "gam" | "admob" | "applovin" | "ironsource";

export type AdFormat = "banner" | "interstitial" | "rewarded" | "native";

export type LogLevel = "info" | "warn" | "error" | "success" | "debug";

export type IntegrationStep =
    | "validate_structure"
    | "check_conflicts"
    | "backup_files"
    | "update_settings_gradle"
    | "update_build_gradle"
    | "update_manifest"
    | "update_proguard"
    | "verify_integration"
    | "cleanup";

export interface IntegrationConfig {
    adNetwork: AdNetwork;
    sdkVersion?: string;
    minSdkVersion?: number;
    compileSdkVersion?: number;
    targetSdkVersion?: number;
}

export interface OrchestrationConfig extends IntegrationConfig {
    placementIds?: {
        banner?: string;
        interstitial?: string;
        rewarded?: string;
        native?: string;
    };
}

export interface ValidationResult {
    valid: boolean;
    score: number;
    maxScore: number;
    issues: ValidationIssue[];
    warnings: string[];
    suggestions: string[];
}

export interface ValidationIssue {
    severity: "error" | "warning" | "info";
    file: string;
    message: string;
    fix?: string;
}

export interface DependencyInfo {
    group: string;
    artifact: string;
    version: string;
    scope?: string;
}

export interface ConflictDetectionResult {
    hasConflicts: boolean;
    conflicts: DependencyConflict[];
    warnings: string[];
}

export interface DependencyConflict {
    type: "version" | "duplicate" | "incompatible";
    dependency: DependencyInfo;
    conflictWith?: DependencyInfo;
    message: string;
    resolution?: string;
}

export interface BackupInfo {
    timestamp: string;
    files: BackupFile[];
}

export interface BackupFile {
    path: string;
    content: string;
}

export interface ProgressTracker {
    totalSteps: number;
    currentStep: number;
    currentStepName: string;
    completed: IntegrationStep[];
    failed: IntegrationStep[];
}

export interface VersionInfo {
    version: string;
    releaseDate?: string;
    isLatest: boolean;
    isStable: boolean;
}

export interface MavenArtifactInfo {
    group: string;
    artifact: string;
    latestVersion: string;
    versions: VersionInfo[];
}

export interface FileModification {
    file: string;
    action: "create" | "update" | "delete";
    success: boolean;
    error?: string;
    backup?: string;
}

export interface IntegrationResult {
    success: boolean;
    filesModified: FileModification[];
    backupId?: string;
    errors: string[];
    warnings: string[];
    nextSteps: string[];
    dashboardInstructions?: string;
}

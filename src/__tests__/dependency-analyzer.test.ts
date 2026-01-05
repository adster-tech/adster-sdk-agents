import { DependencyAnalyzer } from '../dependency-analyzer.js';
import { DependencyInfo } from '../types.js';

describe('DependencyAnalyzer', () => {
    it('should detect version conflicts', () => {
        const dependencies: DependencyInfo[] = [
            { group: 'androidx.appcompat', artifact: 'appcompat', version: '1.6.0', scope: 'implementation' },
            { group: 'androidx.appcompat', artifact: 'appcompat', version: '1.6.1', scope: 'implementation' },
        ];

        const analyzer = new DependencyAnalyzer(dependencies);
        const result = analyzer.analyze();

        expect(result.hasConflicts).toBe(true);
        expect(result.conflicts).toHaveLength(1);
        expect(result.conflicts[0].type).toBe('version');
    });

    it('should detect multiple custom adapters', () => {
        const dependencies: DependencyInfo[] = [
            { group: 'com.adstertech', artifact: 'customadapter-lite', version: '2.2.1', scope: 'implementation' },
            { group: 'com.adstertech', artifact: 'customadapter-applovin', version: '2.1.4', scope: 'implementation' },
        ];

        const analyzer = new DependencyAnalyzer(dependencies);
        const result = analyzer.analyze();

        expect(result.hasConflicts).toBe(true);
        expect(result.conflicts.some((c: any) => c.type === 'duplicate')).toBe(true);
    });

    it('should detect orchestration SDK + custom adapter conflict', () => {
        const dependencies: DependencyInfo[] = [
            { group: 'com.adstertech', artifact: 'orchestration-sdk', version: '1.0.0', scope: 'implementation' },
            { group: 'com.adstertech', artifact: 'customadapter-lite', version: '2.2.1', scope: 'implementation' },
        ];

        const analyzer = new DependencyAnalyzer(dependencies);
        const result = analyzer.analyze();

        expect(result.hasConflicts).toBe(true);
        expect(result.conflicts.some((c: any) => c.type === 'incompatible')).toBe(true);
    });

    it('should warn about old adapter versions', () => {
        const dependencies: DependencyInfo[] = [
            { group: 'com.adstertech', artifact: 'customadapter-lite', version: '1.0.0', scope: 'implementation' },
        ];

        const analyzer = new DependencyAnalyzer(dependencies);
        const result = analyzer.analyze();

        expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should not report conflicts for clean dependencies', () => {
        const dependencies: DependencyInfo[] = [
            { group: 'androidx.appcompat', artifact: 'appcompat', version: '1.6.1', scope: 'implementation' },
            { group: 'com.adstertech', artifact: 'customadapter-lite', version: '2.2.1', scope: 'implementation' },
            { group: 'com.google.android.gms', artifact: 'play-services-ads', version: '22.6.0', scope: 'implementation' },
        ];

        const analyzer = new DependencyAnalyzer(dependencies);
        const result = analyzer.analyze();

        expect(result.hasConflicts).toBe(false);
    });

    it('should generate a report', () => {
        const dependencies: DependencyInfo[] = [
            { group: 'com.adstertech', artifact: 'customadapter-lite', version: '2.2.1', scope: 'implementation' },
        ];

        const analyzer = new DependencyAnalyzer(dependencies);
        const report = analyzer.generateReport();

        expect(report).toContain('Dependency Analysis Report');
        expect(typeof report).toBe('string');
    });
});

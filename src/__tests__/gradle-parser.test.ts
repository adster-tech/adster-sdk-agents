import { GradleParser } from '../gradle-parser.js';

describe('GradleParser', () => {
    describe('Groovy DSL', () => {
        const sampleGradle = `
dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.gms:play-services-ads:22.6.0'
}
`;

        it('should parse dependencies correctly', () => {
            const parser = new GradleParser(sampleGradle, false);
            const deps = parser.parseDependencies();

            expect(deps).toHaveLength(2);
            expect(deps[0]).toMatchObject({
                group: 'androidx.appcompat',
                artifact: 'appcompat',
                version: '1.6.1',
            });
        });

        it('should add dependency correctly', () => {
            const parser = new GradleParser(sampleGradle, false);
            const added = parser.addDependency('com.adstertech:customadapter-lite:2.2.1');

            expect(added).toBe(true);
            expect(parser.getContent()).toContain("implementation 'com.adstertech:customadapter-lite:2.2.1'");
        });

        it('should detect existing dependencies', () => {
            const parser = new GradleParser(sampleGradle, false);
            const hasDep = parser.hasDependency('androidx.appcompat', 'appcompat');

            expect(hasDep).toBe(true);
        });

        it('should not add duplicate dependencies', () => {
            const parser = new GradleParser(sampleGradle, false);
            const added = parser.addDependency('androidx.appcompat:appcompat:1.6.1');

            expect(added).toBe(false);
        });

        it('should remove dependencies', () => {
            const parser = new GradleParser(sampleGradle, false);
            const removed = parser.removeDependency('androidx.appcompat', 'appcompat');

            expect(removed).toBe(true);
            expect(parser.getContent()).not.toContain('androidx.appcompat:appcompat');
        });

        it('should add repository correctly', () => {
            const gradle = `
repositories {
    google()
}
`;
            const parser = new GradleParser(gradle, false);
            const added = parser.addRepository('mavenCentral');

            expect(added).toBe(true);
            expect(parser.getContent()).toContain('mavenCentral()');
        });

        it('should extract SDK versions', () => {
            const gradle = `
android {
    compileSdk 34
    defaultConfig {
        minSdk 21
        targetSdk 34
    }
}
`;
            const parser = new GradleParser(gradle, false);
            const versions = parser.extractSdkVersions();

            expect(versions.minSdk).toBe(21);
            expect(versions.targetSdk).toBe(34);
            expect(versions.compileSdk).toBe(34);
        });
    });

    describe('Kotlin DSL', () => {
        const sampleGradle = `
dependencies {
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.gms:play-services-ads:22.6.0")
}
`;

        it('should parse Kotlin DSL dependencies', () => {
            const parser = new GradleParser(sampleGradle, true);
            const deps = parser.parseDependencies();

            expect(deps).toHaveLength(2);
            expect(deps[0].group).toBe('androidx.appcompat');
        });

        it('should add Kotlin DSL dependency', () => {
            const parser = new GradleParser(sampleGradle, true);
            parser.addDependency('com.adstertech:customadapter-lite:2.2.1');

            expect(parser.getContent()).toContain('implementation("com.adstertech:customadapter-lite:2.2.1")');
        });
    });
});

import { ManifestParser } from '../manifest-parser.js';

describe('ManifestParser', () => {
    const sampleManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.app">
    
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application
        android:name=".MyApplication"
        android:label="@string/app_name">
        
        <meta-data
            android:name="com.example.KEY"
            android:value="value123" />
            
    </application>
</manifest>`;

    it('should parse manifest correctly', () => {
        const parser = new ManifestParser(sampleManifest);
        expect(parser.getPackageName()).toBe('com.example.app');
    });

    it('should detect existing permissions', () => {
        const parser = new ManifestParser(sampleManifest);
        expect(parser.hasPermission('INTERNET')).toBe(true);
        expect(parser.hasPermission('android.permission.INTERNET')).toBe(true);
        expect(parser.hasPermission('ACCESS_NETWORK_STATE')).toBe(false);
    });

    it('should add new permission', () => {
        const parser = new ManifestParser(sampleManifest);
        const added = parser.addPermission('ACCESS_NETWORK_STATE');

        expect(added).toBe(true);
        expect(parser.hasPermission('ACCESS_NETWORK_STATE')).toBe(true);
    });

    it('should not duplicate permissions', () => {
        const parser = new ManifestParser(sampleManifest);
        const added = parser.addPermission('INTERNET');

        expect(added).toBe(false);
    });

    it('should get all permissions', () => {
        const parser = new ManifestParser(sampleManifest);
        const permissions = parser.getPermissions();

        expect(permissions).toContain('android.permission.INTERNET');
    });

    it('should detect existing meta-data', () => {
        const parser = new ManifestParser(sampleManifest);
        expect(parser.hasMetaData('com.example.KEY')).toBe(true);
        expect(parser.hasMetaData('com.example.OTHER')).toBe(false);
    });

    it('should add new meta-data', () => {
        const parser = new ManifestParser(sampleManifest);
        parser.setMetaData('com.adstertech.PLACEMENT_ID', 'placement123');

        expect(parser.hasMetaData('com.adstertech.PLACEMENT_ID')).toBe(true);
    });

    it('should update existing meta-data', () => {
        const parser = new ManifestParser(sampleManifest);
        parser.setMetaData('com.example.KEY', 'newvalue');

        const content = parser.getContent();
        expect(content).toContain('newvalue');
    });

    it('should remove meta-data', () => {
        const parser = new ManifestParser(sampleManifest);
        const removed = parser.removeMetaData('com.example.KEY');

        expect(removed).toBe(true);
        expect(parser.hasMetaData('com.example.KEY')).toBe(false);
    });

    it('should set application attributes', () => {
        const parser = new ManifestParser(sampleManifest);
        parser.setApplicationAttribute('usesCleartextTraffic', 'true');

        const content = parser.getContent();
        expect(content).toContain('usesCleartextTraffic');
    });

    it('should preserve XML structure', () => {
        const parser = new ManifestParser(sampleManifest);
        parser.addPermission('CAMERA');

        const content = parser.getContent();
        expect(content).toContain('<?xml');
        expect(content).toContain('</manifest>');
    });
});

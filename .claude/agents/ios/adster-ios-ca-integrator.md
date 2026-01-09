---
name: adster-ios-ca-integrator
description: Integrates Adster Custom Adapter into iOS projects with automatic configuration for GAM or AdMob mediation
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

# Adster Custom Adapter Integrator (iOS)

**Version**: 1.2.9 (CocoaPods/SPM)
**Last Updated**: January 2025

## IMPORTANT: User-Facing Guidelines

When completing the integration, you must inform the user about:
1. **Pod Install/SPM Required**: "Please run `pod install` or resolve SPM packages after integration"
2. **Dashboard Configuration**: "Configure Adster in your mediation dashboard (instructions provided below)"
3. **No Code Changes**: "No additional code changes needed - use your existing mediation SDK APIs"
4. **Workspace Usage**: "Always open `.xcworkspace` if using CocoaPods"

---

## Integration Steps

### Step 1: Validate Project Structure

Before starting integration, verify the iOS project structure:

```bash
# Check for required files
- Podfile (for CocoaPods) OR Package.swift / Xcode project with SPM support
- Info.plist (or Info tab in Xcode)
- *.xcodeproj or *.xcworkspace
```

If any required files are missing, inform the user and halt integration.

### Step 2: Determine Ad Network

Ask the user which mediation network they're using:
- **Google Ad Manager (GAM)**
- **AdMob**

If not specified, default to **AdMob** and inform the user.

### Step 3: Determine Dependency Manager

Ask the user if they prefer:
- **CocoaPods** (recommended for most projects)
- **Swift Package Manager (SPM)** (for modern Xcode projects)

If not specified, default to **CocoaPods** and inform the user.

### Step 4: Add Dependency

#### Option A: CocoaPods

Update `Podfile`:

**For GAM or AdMob:**
```ruby
pod 'Adster', '~> 1.2.9'
```

Then run:
```bash
pod install --repo-update
```

**Important**: Always open `.xcworkspace` after pod install, not `.xcodeproj`.

#### Option B: Swift Package Manager (SPM)

1. In Xcode: **File > Add Package Dependencies**
2. Add the repository URL: `https://github.com/adster-tech/orchestration-sdk-ios`
3. Select version **1.2.9** or "Up to Next Major Version"
4. Add to your target

**Note**: The same SDK package is used for both GAM and AdMob integrations.

### Step 5: Configure Info.plist

Update `Info.plist` to include required keys:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

Or add via Xcode:
1. Open Info.plist (or Info tab in target settings)
2. Add `App Transport Security Settings` dictionary
3. Add `Allows Arbitrary Loads` = `YES`

**Note**: Only add if not already present. Some projects may have stricter ATS settings.

### Step 6: Add SKAdNetwork IDs (if required)

If your mediation network requires SKAdNetwork IDs, add them to `Info.plist`:

```xml
<key>SKAdNetworkItems</key>
<array>
    <dict>
        <key>SKAdNetworkIdentifier</key>
        <string>YOUR_ADSTER_SKADNETWORK_ID</string>
    </dict>
</array>
```

**Note**: Check Adster documentation for the correct SKAdNetwork ID for your integration.

### Step 7: Provide Dashboard Configuration Instructions

After completing the file modifications, provide the user with platform-specific dashboard configuration instructions:

#### For Google Ad Manager (GAM):

1. **Create Custom Event in GAM:**
   - Navigate to **Delivery > Custom Events**
   - Create a new custom event named "Adster"

2. **Configure Class Names:**
   - **Banner**: `AdsFramework.AdSterMediationCustomEvent`
   - **Interstitial**: `AdsFramework.AdSterMediationCustomEvent`
   - **Rewarded**: `AdsFramework.AdSterMediationCustomEvent`
   - **Native**: `AdsFramework.AdSterMediationCustomEvent`

3. **Set Parameter**: Add your Adster Placement ID in the parameter field

4. **Full documentation**: https://ca-docs.adster.tech/google-ad-manager

#### For AdMob:

1. **Create Custom Event in AdMob:**
   - Navigate to **Mediation > Create Mediation Group**
   - Choose the ad format you want (banner, interstitial, rewarded, native)
   - Add Adster as a **Custom Event**

2. **Configure Class Names:**
   - **Banner**: `AdsFramework.AdSterMediationCustomEvent`
   - **Interstitial**: `AdsFramework.AdSterMediationCustomEvent`
   - **Rewarded**: `AdsFramework.AdSterMediationCustomEvent`
   - **Native**: `AdsFramework.AdSterMediationCustomEvent`

3. **Parameter**: Add your Adster Placement ID in the parameter field

4. **Full documentation**: https://ca-docs.adster.tech/admob-ios

---

## Integration Report Template

After completing integration, provide a summary using this template:

### Files Modified
- `Podfile` or `Package.swift` - Added Adster Custom Adapter dependency
- `Info.plist` - Added required permissions and settings
- `.xcworkspace` - Updated (if using CocoaPods)

### Integration Details
- **Ad Network**: [GAM/AdMob]
- **Adapter Version**: 1.2.9
- **Dependency Manager**: [CocoaPods/SPM]
- **Custom Adapter Package**: Adster (CocoaPods) or orchestration-sdk-ios (SPM)

### Next Steps
1. ✅ Run `pod install` (if using CocoaPods) or resolve SPM packages
2. ✅ Open `.xcworkspace` (not `.xcodeproj`) if using CocoaPods
3. ✅ Configure Adster in your [platform] dashboard using the instructions above
4. ✅ Test your integration by requesting ads through your existing mediation code
5. ✅ No additional code changes needed!

### Support
- **Documentation**: https://ca-docs.adster.tech/
- **Dashboard**: https://dashboard.adster.tech/
- **Support**: support@adster.tech

---

## Best Practices

1. **Always use the latest stable version** unless the user specifies otherwise
2. **Verify Info.plist configuration** - ensure ATS settings are correct
3. **Preserve existing dependencies** - only add Adster, don't modify others
4. **Check for conflicts** with existing Adster dependencies before adding
5. **Validate Podfile syntax** or SPM package configuration
6. **Inform users about dashboard configuration** - this is critical for the adapter to work
7. **Remind users to use workspace** - critical for CocoaPods projects

## Testing Checklist

Before marking integration as complete, verify:
- [ ] Dependency added correctly (Podfile or SPM)
- [ ] Info.plist updated with required settings
- [ ] Integration report provided to user
- [ ] Dashboard configuration instructions provided
- [ ] User informed about pod install/SPM resolve requirement
- [ ] User informed about workspace usage (if CocoaPods)

## Common Issues & Solutions

**Issue**: Pod install fails after adding dependency
- **Solution**: Verify the version number is correct and CocoaPods repo is up to date. Try `pod repo update` first.

**Issue**: User opens .xcodeproj instead of .xcworkspace
- **Solution**: Always remind users to open `.xcworkspace` when using CocoaPods

**Issue**: SPM package not found
- **Solution**: Verify the repository URL is correct and accessible

**Issue**: User doesn't know their Adster Placement ID
- **Solution**: Direct them to https://dashboard.adster.tech/ to retrieve their placement IDs

**Issue**: Build errors after integration
- **Solution**: Clean build folder (Cmd+Shift+K) and rebuild. Ensure all dependencies are resolved.

---

## Completion Verification

Before completing the task, ensure:
1. All required files have been modified
2. No syntax errors introduced
3. User has been provided with complete dashboard configuration instructions
4. User has been informed about next steps (pod install/SPM resolve + dashboard config)
5. User has been reminded about workspace usage (if CocoaPods)
6. Support resources have been shared

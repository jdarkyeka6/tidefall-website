# Tidefall TestFlight

Tidefall now ships to TestFlight through GitHub Actions using Expo prebuild plus Apple's native Xcode/App Store Connect tooling. Fastlane and EAS are not required for the CI upload path.

## GitHub repository secrets

The workflow requires these Actions secrets:

- `ASC_KEY_ID`
- `ASC_ISSUER_ID`
- `ASC_KEY_CONTENT` — the App Store Connect `.p8` private key contents, or a base64-encoded copy
- `APPLE_TEAM_ID`

## Ship a beta

1. Open the repository's **Actions** tab.
2. Select **Tidefall TestFlight**.
3. Choose **Run workflow** on `main`.
4. The workflow checks out `feature/tidefall-app-v2`, installs dependencies, regenerates the iOS project with Expo, installs CocoaPods, archives with automatic Apple signing, exports an IPA, and uploads it to App Store Connect.

The GitHub Actions run number is used as the iOS build number so new workflow runs do not reuse an already-uploaded build number.

## Failure diagnostics

If Xcode fails, the workflow prints an error digest near the bottom of the job and uploads a `tidefall-ios-diagnostics-*` artifact containing the archive/export logs, Xcode result bundle when available, and Podfile lockfile.

## App identifiers

- App name: Tidefall
- Bundle ID: `au.com.tidefall.app`
- Version: `1.0.0`

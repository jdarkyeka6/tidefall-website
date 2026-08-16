# Tidefall TestFlight

The app is configured for EAS Build + EAS Submit.

## First time only

From the `mobile-app` folder:

```bash
npm install
npx eas-cli@latest login
npm run testflight
```

On the first run, EAS may ask to create/link the Expo project and set up Apple signing credentials. Sign in with the Apple Developer account that owns the Tidefall App Store Connect app. If the Tidefall app record does not exist yet, create it in App Store Connect using bundle ID `au.com.tidefall.app` before submitting.

## Every beta after that

```bash
npm run testflight
```

The production profile automatically increments the iOS build number and `--auto-submit` uploads the successful build to App Store Connect. After Apple processes the build, enable it for your TestFlight tester group in App Store Connect.

## App identifiers

- App name: Tidefall
- Bundle ID: `au.com.tidefall.app`
- Version: `1.0.0`
- EAS profile: `production`

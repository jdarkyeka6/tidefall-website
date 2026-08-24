#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="Tidefall"
SCHEME="Tidefall"
APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$APP_ROOT/ios"
BUILD_DIR="$APP_ROOT/build"
ARCHIVE_PATH="$BUILD_DIR/Tidefall.xcarchive"
EXPORT_DIR="$BUILD_DIR/export"
ARCHIVE_LOG="$BUILD_DIR/archive.log"
EXPORT_LOG="$BUILD_DIR/export.log"
RESULT_BUNDLE="$BUILD_DIR/Tidefall.xcresult"
EXPORT_PLIST="$BUILD_DIR/ExportOptions.plist"

required=(ASC_KEY_ID ASC_ISSUER_ID ASC_KEY_CONTENT APPLE_TEAM_ID)
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "::error::Missing required secret: $name"
    exit 2
  fi
done

cd "$APP_ROOT"
mkdir -p "$BUILD_DIR"
rm -rf "$BUILD_DIR"/*
mkdir -p "$EXPORT_DIR"

KEY_DIR="$HOME/.appstoreconnect/private_keys"
KEY_PATH="$KEY_DIR/AuthKey_${ASC_KEY_ID}.p8"
mkdir -p "$KEY_DIR"

# Accept either the literal .p8 contents or a base64-encoded .p8 secret.
python3 - "$KEY_PATH" <<'PY'
import base64
import os
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
raw = os.environ["ASC_KEY_CONTENT"].strip()
if "BEGIN PRIVATE KEY" not in raw:
    try:
        raw = base64.b64decode(raw).decode("utf-8")
    except Exception as exc:
        raise SystemExit(f"ASC_KEY_CONTENT is not a valid .p8 key or base64 .p8: {exc}")
if "BEGIN PRIVATE KEY" not in raw or "END PRIVATE KEY" not in raw:
    raise SystemExit("ASC_KEY_CONTENT does not contain a complete private key")
path.write_text(raw + ("\n" if not raw.endswith("\n") else ""), encoding="utf-8")
path.chmod(0o600)
PY

print_digest() {
  local log="$1"
  echo
  echo "================ XCODE ERROR DIGEST ================"
  if [[ -f "$log" ]]; then
    local matches
    matches="$(grep -Eai '(^|[[:space:]])(error:|fatal error:)|provision|signing|codesign|certificate|PhaseScriptExecution|Command .* failed|ARCHIVE FAILED|EXPORT FAILED|No profiles|requires a provisioning profile|not permitted' "$log" | tail -n 120 || true)"
    if [[ -n "$matches" ]]; then
      printf '%s\n' "$matches"
    else
      tail -n 120 "$log" || true
    fi
  else
    echo "No Xcode log was produced."
  fi
  echo "===================================================="
  echo
}

run_logged() {
  local logfile="$1"
  shift
  set +e
  "$@" 2>&1 | tee "$logfile"
  local status=${PIPESTATUS[0]}
  set -e
  if [[ $status -ne 0 ]]; then
    print_digest "$logfile"
    return "$status"
  fi
}

echo "==> Recreating native iOS project"
rm -rf "$IOS_DIR"
npx expo prebuild --platform ios --non-interactive --clean

if [[ ! -d "$IOS_DIR" ]]; then
  echo "::error::Expo prebuild did not create $IOS_DIR"
  exit 3
fi

echo "==> Installing CocoaPods"
(
  cd "$IOS_DIR"
  pod install
)

PROJECT_PATH="$(find "$IOS_DIR" -maxdepth 1 -name '*.xcodeproj' -print -quit)"
WORKSPACE_PATH="$(find "$IOS_DIR" -maxdepth 1 -name '*.xcworkspace' -print -quit)"

if [[ -z "$PROJECT_PATH" ]]; then
  echo "::error::No .xcodeproj was generated in $IOS_DIR"
  exit 4
fi

if [[ -n "$WORKSPACE_PATH" ]]; then
  CONTAINER_ARGS=(-workspace "$WORKSPACE_PATH")
  echo "==> Using workspace: $WORKSPACE_PATH"
else
  CONTAINER_ARGS=(-project "$PROJECT_PATH")
  echo "::warning::No .xcworkspace found. Falling back to project: $PROJECT_PATH"
fi

echo "==> Verifying scheme"
xcodebuild "${CONTAINER_ARGS[@]}" -list

BUILD_NUMBER="${GITHUB_RUN_NUMBER:-1}"
echo "==> Build number: $BUILD_NUMBER"

AUTH_ARGS=(
  -allowProvisioningUpdates
  -authenticationKeyPath "$KEY_PATH"
  -authenticationKeyID "$ASC_KEY_ID"
  -authenticationKeyIssuerID "$ASC_ISSUER_ID"
)

cat > "$EXPORT_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store-connect</string>
  <key>destination</key>
  <string>export</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>teamID</key>
  <string>${APPLE_TEAM_ID}</string>
  <key>manageAppVersionAndBuildNumber</key>
  <false/>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>uploadSymbols</key>
  <true/>
</dict>
</plist>
PLIST

echo "==> Archiving $APP_NAME"
if ! run_logged "$ARCHIVE_LOG" \
  xcodebuild \
    "${CONTAINER_ARGS[@]}" \
    -scheme "$SCHEME" \
    -configuration Release \
    -destination 'generic/platform=iOS' \
    -archivePath "$ARCHIVE_PATH" \
    -resultBundlePath "$RESULT_BUNDLE" \
    DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
    CODE_SIGN_STYLE=Automatic \
    CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
    "${AUTH_ARGS[@]}" \
    archive; then
  echo "::error::Xcode archive failed. See the digest above and archive.log artifact."
  exit 10
fi

echo "==> Exporting IPA"
if ! run_logged "$EXPORT_LOG" \
  xcodebuild \
    -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_DIR" \
    -exportOptionsPlist "$EXPORT_PLIST" \
    "${AUTH_ARGS[@]}"; then
  echo "::error::Xcode export failed. See the digest above and export.log artifact."
  exit 11
fi

IPA_PATH="$(find "$EXPORT_DIR" -maxdepth 1 -name '*.ipa' -print -quit)"
if [[ -z "$IPA_PATH" ]]; then
  echo "::error::Xcode export completed but no IPA was produced."
  exit 12
fi

echo "==> Uploading IPA to App Store Connect"
xcrun altool \
  --upload-app \
  -f "$IPA_PATH" \
  -t ios \
  --apiKey "$ASC_KEY_ID" \
  --apiIssuer "$ASC_ISSUER_ID"

echo "✅ Tidefall build $BUILD_NUMBER uploaded to App Store Connect/TestFlight."

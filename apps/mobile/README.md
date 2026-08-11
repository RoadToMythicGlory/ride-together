# Ride Together — mobile (Capacitor)

Native shell around the Next.js web app for App Store / Play Store binaries.

- **Bundle ID:** `org.ridetogether.app`
- **Platforms scaffolded:** `android/` + `ios/` (CocoaPods runs on Codemagic Mac)
- **CI:** repo-root [`codemagic.yaml`](../../codemagic.yaml)

## Already in this repo

1. Capacitor app id + name
2. Branded icons (from `/apps/web/public/brand/logo.png`)
3. Android + iOS native projects
4. Codemagic workflows: **iOS → TestFlight** and **Android debug APK**

## One-time setup (then CI builds)

### A. Production web URL (required)

The native app is a WebView shell. It needs a **public HTTPS** Ride Together site, not `localhost`.

Set in Codemagic env group `ride_together_mobile`:

```text
CAPACITOR_SERVER_URL=https://YOUR-REAL-DOMAIN
```

### B. Codemagic

1. [codemagic.io](https://codemagic.io) → add this GitHub repo → enable `codemagic.yaml`
2. **Integrations** → App Store Connect API key → name it exactly `RideTogether` (matches yaml)
3. **Environment variables** → group `ride_together_mobile`:
   - `CAPACITOR_SERVER_URL` = `https://…`
   - `APP_STORE_APPLE_ID` = numeric id after you create the app in App Store Connect
4. **Code signing** → automatic for `org.ridetogether.app` (App Store distribution), or upload cert + profile
5. App Store Connect → create app **Ride Together**, bundle id `org.ridetogether.app`
6. Start workflow **iOS → TestFlight**

### D. Local Android (optional, on this Windows PC)

```powershell
cd apps\mobile
$env:CAPACITOR_SERVER_URL = "https://YOUR-REAL-DOMAIN"
npx cap sync android
npx cap open android
```

## Google Sign-In (native)

The web app detects Capacitor and uses [`@capgo/capacitor-social-login`](https://github.com/Cap-go/capacitor-social-login) instead of the browser Google button. After `pnpm install`, run `npx cap sync` to pull the native plugin in.

Google Cloud project: **ridetogether-505216** (clients under *Google Auth Platform → Clients*).

### iOS

1. iOS OAuth client already exists (`RideTogether iOS`, bundle `org.ridetogether.app`).
2. Add the reversed client id as a URL scheme in `ios/App/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.705514632415-jlrrk4c6rrlmvsjv3835jhh3dpt1s6qv</string>
    </array>
  </dict>
</array>
```

3. Ensure the web static export is built with `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID_IOS` set (add them to the `ride_together_mobile` Codemagic env group).

### Android

Android sign-in uses Credential Manager with the **web** client id, but Google still requires an **Android** OAuth client (package name + SHA-1) in the same project:

1. Get your signing SHA-1: `cd apps/mobile/android && ./gradlew signingReport` (debug keystore for local builds; use the release/Play App Signing SHA-1 for store builds).
2. Google Cloud console → Google Auth Platform → Clients → Create client → **Android** → package `org.ridetogether.app` + the SHA-1.
3. No client id needs to be copied anywhere — the plugin passes the web client id (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`).

## Store notes

- Age rating: **17+** — adults only. Not a Kids app.
- Privacy Policy: production `/privacy`
- Account deletion: Settings → delete account
- Release builds must use HTTPS (`CAPACITOR_SERVER_URL`); cleartext is disabled automatically for `https://`

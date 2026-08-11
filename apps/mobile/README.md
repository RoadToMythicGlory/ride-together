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

## Store notes

- Age rating: **17+** — adults only. Not a Kids app.
- Privacy Policy: production `/privacy`
- Account deletion: Settings → delete account
- Release builds must use HTTPS (`CAPACITOR_SERVER_URL`); cleartext is disabled automatically for `https://`

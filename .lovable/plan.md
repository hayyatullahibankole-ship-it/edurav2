# Fix deploy failure: Capacitor version conflict

## What's wrong

The deploy runs `npm install` and fails. One package, `@capacitor/browser`, was installed at version 8, but every other Capacitor package in the project is version 7. Capacitor 8 plugins refuse to work with a Capacitor 7 core, so the install aborts.

## The fix

Downgrade `@capacitor/browser` to the version 7 line so it matches the rest of the Capacitor packages:

- `@capacitor/browser`: `^8.0.4` -> `^7.0.2`

This keeps everything on Capacitor 7 (android, ios, core, cli, app, haptics, push-notifications, splash-screen, status-bar all stay unchanged). No app code changes are needed — the Browser plugin API used in `src/lib/openExternal.ts` is identical in v7.

## Technical steps

1. Run `bun remove @capacitor/browser` then `bun add @capacitor/browser@^7.0.2` so `package.json` and the lockfile stay in sync.
2. Confirm no other dependency declares a Capacitor 8 peer requirement.
3. Verify the build passes.

After this, redeploy — `npm install` will resolve cleanly without needing `--legacy-peer-deps`.

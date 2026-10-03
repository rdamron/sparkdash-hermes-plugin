# sparkdash-hermes-plugin

A [Hermes Agent](https://github.com/NousResearch/hermes-agent) **web-dashboard plugin** that adds a clickable **SparkDash** tab to the top nav of `hermes dashboard`. The tab renders [sparkDash](https://github.com/MiaAI-Lab/sparkDash) (DGX Spark GPU telemetry) as a full-page iframe.

## Install

```bash
hermes plugins install rdamron/sparkdash-hermes-plugin
hermes config set plugins.enabled '["sparkdash-rail", ...existing...]'
```

Then open the dashboard and click **SparkDash** in the nav. If the dashboard was already running, restart it (or `GET /api/dashboard/plugins/rescan` from an authenticated tab) so it discovers the new plugin.

## Configuration

The sparkDash URL is hardcoded in `dashboard/dist/index.js` (`SPARKDASH_URL`, default `http://172.24.3.48:5555`). Edit that line and refresh the dashboard — plugin bundles are served from disk per request, no rebuild needed.

## How it works

Plain, slot-free dashboard plugin: a visible tab at `/sparkdash` whose registered component is a full-page iframe (`height: calc(100dvh - 7rem)` so the dashboard chrome stays clickable). No backend, no Python deps, no theme changes.

## Notes / gotchas learned building this

- The dashboard-plugin docs advertise a `sidebar` shell slot rendered by `layoutVariant: cockpit` — it is **not implemented** in the shipped build (no `<PluginSlot name="sidebar" />` anywhere). Docking an external tool into a left rail requires the `overlay` slot + theme `customCSS` instead; we tried it and reverted to the plain tab.
- User-source dashboard plugins only serve when listed in `plugins.enabled`.
- Plugin manifests are cached per dashboard process; discovery rescans automatically when a cached plugin directory disappears.

## Files

```
plugin.yaml                    # root manifest (name: sparkdash-rail) — used by `hermes plugins install`
dashboard/manifest.json        # dashboard UI manifest (visible tab, /sparkdash)
dashboard/dist/index.js        # the plugin bundle (IIFE, no build step)
```

MIT licensed. Verified against Hermes 0.21.5.

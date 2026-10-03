# sparkdash-hermes-plugin

A [Hermes Agent](https://github.com/NousResearch/hermes-agent) **web-dashboard plugin** that adds a clickable **SparkDash** tab to the top nav of `hermes dashboard`. The tab renders [sparkDash](https://github.com/MiaAI-Lab/sparkDash) (DGX Spark GPU telemetry) as a full-page iframe.

## Install

```bash
hermes plugins install rdamron/sparkdash-hermes-plugin
hermes config set plugins.enabled '["sparkdash-rail", ...existing...]'
```

Then open the dashboard and click **SparkDash** in the nav. If the dashboard was already running, restart it (or `GET /api/dashboard/plugins/rescan` from an authenticated tab) so it discovers the new plugin.

## Configuration

**In the dashboard:** Plugins page → **SparkDash** card at the top — set the sparkDash URL (host or full URL, e.g. `172.24.3.49:5555` or `http://172.24.3.48:5555`). Empty = default `http://172.24.3.48:5555`. Saved via the plugin's backend to `~/.hermes/plugin-data/sparkdash-rail/config.json` (the documented per-plugin store — survives updates and removal) and takes effect on the next SparkDash tab load.

The default URL also lives in `dashboard/dist/index.js` (`DEFAULT_URL`) and `dashboard/plugin_api.py` if you want to change the shipped fallback.

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
dashboard/plugin_api.py        # backend: GET/POST /api/plugins/sparkdash-rail/config
```

MIT licensed. Verified against Hermes 0.21.5.

(function () {
  "use strict";

  var DEFAULT_URL = "http://172.24.3.48:5555";
  var CONFIG_ENDPOINT = "/api/plugins/sparkdash-rail/config";

  var SDK = window.__HERMES_PLUGIN_SDK__;
  var React = SDK.React;
  var hooks = SDK.hooks;
  var components = SDK.components;
  var Card = components.Card, CardContent = components.CardContent,
      CardHeader = components.CardHeader, CardTitle = components.CardTitle,
      Input = components.Input, Button = components.Button;

  function fetchConfig() {
    return SDK.fetchJSON(CONFIG_ENDPOINT).then(function (r) {
      return (r && r.url) || "";
    });
  }

  function normalizeUrl(raw) {
    var v = (raw || "").trim().replace(/\/+$/, "");
    if (!v) return "";
    if (v.indexOf("://") === -1) v = "http://" + v;
    return v;
  }

  // ── /sparkdash tab: full-page iframe at the configured URL ──────────────
  function SparkDashPage() {
    var state = hooks.useState("");
    var url = state[0], setUrl = state[1];
    var loaded = hooks.useState(false);
    var isLoaded = loaded[0], setLoaded = loaded[1];

    hooks.useEffect(function () {
      var alive = true;
      fetchConfig()
        .then(function (u) { if (alive) { setUrl(u); setLoaded(true); } })
        .catch(function () { if (alive) setLoaded(true); });
      return function () { alive = false; };
    }, []);

    if (!isLoaded) {
      return React.createElement(
        "div", { style: { padding: "1rem", fontSize: "0.875rem", opacity: 0.65 } },
        "Loading SparkDash settings…"
      );
    }

    var src = url || DEFAULT_URL;
    return React.createElement("iframe", {
      src: src,
      title: "SparkDash",
      style: {
        width: "100%",
        height: "calc(100dvh - 7rem)",
        border: "0",
        display: "block",
        borderRadius: "0.5rem",
      },
    });
  }

  // ── Plugins page: settings card (registered into the plugins:top slot) ──
  function SparkDashSettingsCard() {
    var sState = hooks.useState("");
    var value = sState[0], setValue = sState[1];
    var lState = hooks.useState(true);
    var loading = lState[0], setLoading = lState[1];
    var bState = hooks.useState(false);
    var busy = bState[0], setBusy = bState[1];
    var mState = hooks.useState("");
    var msg = mState[0], setMsg = mState[1];

    hooks.useEffect(function () {
      var alive = true;
      fetchConfig()
        .then(function (u) { if (alive) { setValue(u); setLoading(false); } })
        .catch(function () { if (alive) setLoading(false); });
      return function () { alive = false; };
    }, []);

    function save() {
      setBusy(true);
      setMsg("");
      SDK.fetchJSON(CONFIG_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizeUrl(value) }),
      })
        .then(function (r) {
          setValue(r.url || "");
          setMsg("Saved — the SparkDash tab now uses " + (r.effective || DEFAULT_URL));
        })
        .catch(function (e) {
          setMsg("Save failed: " + (e && e.message ? e.message : "unknown error"));
        })
        .then(function () { setBusy(false); });
    }

    return React.createElement(
      Card, { style: { marginBottom: "1.5rem" } },
      React.createElement(
        CardHeader, null,
        React.createElement(CardTitle, null, "SparkDash")
      ),
      React.createElement(
        CardContent, { className: "flex flex-col gap-3" },
        React.createElement(
          "p",
          { style: { fontSize: "0.75rem", color: "var(--ui-text-tertiary, var(--color-muted-foreground, inherit))" } },
          "URL of your sparkDash instance (host or full URL). Leave empty to use the default " + DEFAULT_URL + "."
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: "0.5rem", alignItems: "center" } },
          React.createElement(Input, {
            value: loading ? "" : value,
            disabled: loading || busy,
            placeholder: loading ? "Loading…" : "http://172.24.3.48:5555",
            onChange: function (e) { setValue(e && e.target ? e.target.value : e); },
            style: { maxWidth: "26rem" },
          }),
          React.createElement(Button, {
            size: "sm",
            disabled: loading || busy,
            onClick: save,
          }, busy ? "Saving…" : "Save")
        ),
        msg
          ? React.createElement(
              "p",
              { style: { fontSize: "0.75rem", color: "var(--ui-text-secondary, inherit)" } },
              msg
            )
          : null
      )
    );
  }

  window.__HERMES_PLUGINS__.register("sparkdash-rail", SparkDashPage);
  window.__HERMES_PLUGINS__.registerSlot("sparkdash-rail", "plugins:top", SparkDashSettingsCard);
})();

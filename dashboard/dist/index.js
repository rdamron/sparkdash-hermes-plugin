(function () {
  "use strict";

  // sparkDash (DGX Spark GPU dashboard). Change here if the DGX1 IP moves.
  var SPARKDASH_URL = "http://172.24.3.48:5555";

  var SDK = window.__HERMES_PLUGIN_SDK__;
  var React = SDK.React;

  // Full-page iframe mounted at the /sparkdash tab (visible nav entry).
  // Height: viewport minus header + content padding, so the page chrome
  // (nav, footer) stays clickable and sparkDash fills the content area.
  function SparkDashPage() {
    return React.createElement("iframe", {
      src: SPARKDASH_URL,
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

  window.__HERMES_PLUGINS__.register("sparkdash-rail", SparkDashPage);
})();

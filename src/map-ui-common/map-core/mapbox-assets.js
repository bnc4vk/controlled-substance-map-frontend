const DEFAULT_MAPBOX_CSS_URL =
  "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
const DEFAULT_MAPBOX_JS_URL =
  "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";

function ensureStylesheet(url) {
  const existing = document.querySelector(`link[href="${url}"]`);
  if (existing) return existing;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
  return link;
}

function ensureScript(url) {
  const existing = document.querySelector(`script[src="${url}"]`);
  if (existing) return existing;

  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  document.head.appendChild(script);
  return script;
}

export function loadMapboxAssets({
  cssUrl = DEFAULT_MAPBOX_CSS_URL,
  jsUrl = DEFAULT_MAPBOX_JS_URL,
} = {}) {
  const stylesheet = ensureStylesheet(cssUrl);
  const script = ensureScript(jsUrl);

  return Promise.all([
    new Promise((resolve, reject) => {
      if (stylesheet.sheet) {
        resolve();
        return;
      }
      stylesheet.addEventListener("load", () => resolve(), { once: true });
      stylesheet.addEventListener(
        "error",
        () => reject(new Error(`Failed to load ${cssUrl}`)),
        { once: true }
      );
    }),
    new Promise((resolve, reject) => {
      if (window.mapboxgl) {
        resolve();
        return;
      }
      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error(`Failed to load ${jsUrl}`)),
        { once: true }
      );
    }),
  ]).then(() => undefined);
}

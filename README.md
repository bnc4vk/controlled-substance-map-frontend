# Drug Map Frontend

This frontend pulls shared layout and interaction styles from `map-ui-common` and layers
app-specific branding in `style.css`.

## Usage

Include the shared stylesheet before app overrides:

```html
<link rel="stylesheet" href="node_modules/map-ui-common/src/ui/shared-map-ui.css" />
<link rel="stylesheet" href="style.css" />
```

The search tile UI and map helpers also come from `map-ui-common` via import maps in
`index.html`.

## App-specific overrides

Define custom colors and tokens in `style.css` using the shared CSS variables:

```css
:root {
  --map-ui-wrapper-bg: #f5f5f5;
  --map-ui-map-shadow: 0 4px 25px rgba(0,0,0,0.1);
  --map-ui-legend-bg: rgba(255,255,255,0.9);
  --map-ui-legend-item-bg: rgba(255,255,255,0.7);
  --map-ui-legend-shadow: 0 2px 6px rgba(0,0,0,0.15);
  --map-ui-legend-text: #222;
  --map-ui-search-bg: rgba(255, 255, 255, 0.85);
  --map-ui-search-bg-hover: rgba(255, 255, 255, 0.95);
  --map-ui-search-shadow: 0 4px 20px rgba(0,0,0,0.1);
  --map-ui-search-shadow-hover: 0 6px 24px rgba(0,0,0,0.15);
  --map-ui-search-input: #222;
  --map-ui-search-placeholder: #9aa3ad;
  --map-ui-search-submit: #4A90E2;
  --map-ui-search-submit-hover: #3C7CC0;
  --map-ui-search-icon-stroke: #666;
  --map-ui-spinner-track: rgba(0, 0, 0, 0.2);
  --map-ui-spinner-head: #333;
}
```

# Shared Map UI Styles

This repo includes a reusable stylesheet (`shared-map-ui.css`) that defines layout
and interaction patterns for the map container, legend, and search tile. App-
specific branding (colors, tokens, header text, and drug labels) should live in
your app stylesheet (e.g., `style.css`) and override the shared defaults.

## Installing dependencies

This app uses `map-ui-common` as a Git submodule. From the repo root, run:

```bash
git submodule add https://github.com/bnc4vk/map-ui-common.git vendor/map-ui-common
git submodule update --init --recursive
```

If the submodule is already configured, you only need:

```bash
git submodule update --init --recursive
```

## Usage

Include the shared stylesheet before your app-specific styles so you can override
colors and tokens:

```html
<link rel="stylesheet" href="vendor/map-ui-common/src/ui/shared-map-ui.css" />
<link rel="stylesheet" href="style.css" />
```

## HTML/CSS Contract

### Map container

```html
<div class="map-wrapper">
  <div class="map-aspect">
    <div id="map"></div>
  </div>
</div>
```

### Legend

```html
<div class="legend">
  <div class="legend-item">
    <span class="legend-color" style="background-color: #6c5ce7;"></span>
    <span>Legend label</span>
  </div>
</div>
```

### Search tile

```html
<div class="tile search-tile" aria-label="Search substance">
  <div class="search-icon-wrap" role="button" title="Search">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none">
      <!-- icon paths -->
    </svg>
  </div>

  <form class="search-form hidden">
    <input class="search-input" type="text" placeholder="Search..." />
    <button class="search-submit" type="submit">
      <span class="spinner hidden"></span>
    </button>
  </form>
</div>
```

#### State classes

- `.hidden` hides elements for collapsed states.
- `.expanded` on `.search-tile` reveals the input field.

## Brand/Color Overrides

The shared stylesheet uses CSS variables so each app can define its own colors
and tokens. Define these variables in your app stylesheet (example values shown):

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

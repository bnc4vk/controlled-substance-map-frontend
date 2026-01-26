# Controlled Substance Map Frontend

This frontend pulls shared layout and interaction styles from `map-ui-common` and layers
app-specific branding in `style.css`.

## View the local site

From the repo root, run:

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

## Build for GitHub Pages

```bash
npm run build
```

The static site is generated in `dist/`.

## Troubleshooting

If your package cannot find dependency resources, try running `npm install github:bnc4vk/map-ui-common`.

# Controlled Substance Map Frontend

This frontend pulls shared layout and interaction styles from `map-ui-common` and layers
app-specific branding in `style.css`.

## View the local site

From the repo root, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Troubleshooting

If your package cannot find dependency resources, try running `npm install github:bnc4vk/map-ui-common`.

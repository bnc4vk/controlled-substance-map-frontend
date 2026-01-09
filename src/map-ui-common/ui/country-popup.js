export function createCountryPopup({
  map,
  getEntry,
  renderHtml,
  popupOptions = {},
  hideWhen,
} = {}) {
  if (!map) {
    throw new Error("Map instance is required to create a popup.");
  }

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    maxWidth: "240px",
    ...popupOptions,
  });

  function showPopup(event) {
    const iso = event.features?.[0]?.properties?.iso_3166_1?.slice(0, 2);
    if (!iso) return;

    const entry = getEntry?.(iso);
    if (!entry) return;
    if (hideWhen?.(entry, iso)) return;

    const html = renderHtml({ iso, entry });
    popup.setLngLat(event.lngLat).setHTML(html).addTo(map);
  }

  return { popup, showPopup };
}

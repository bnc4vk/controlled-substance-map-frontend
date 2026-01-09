import { createMap } from "map-ui-common/map-core";
import { getMapConfig } from "map-ui-common/map-core/config";
import { fetchDrugStatus } from "./src/adapters/drugDataAdapter.js";
import { createSearchTile, SearchTileController } from "map-ui-common/ui/search-tile";
import { createMapLegend } from "map-ui-common/ui/map-legend";

// --- Mapbox Setup ---
const { accessToken, mapCenter, zoomLevel } = getMapConfig();
mapboxgl.accessToken = accessToken;

// --- Configurations ---
const statusColors = {
  Unknown: "#666666",
  Banned: "#e74c3c",
  "Limited Access Trials": "#f1c40f",
  "Approved Medical Use": "#27ae60",
};

let tileData = {}; // populated from server response

const mapStyle = "mapbox://styles/mapbox/light-v11";

const { map, updateFillColors } = createMap({
  containerId: "map",
  mapStyle,
  center: mapCenter,
  zoom: zoomLevel,
  vectorSourceConfig: {
    id: "countries",
    source: {
      type: "vector",
      url: "mapbox://mapbox.country-boundaries-v1",
    },
  },
  layerConfig: {
    baseLayer: {
      id: "countries-first-view",
      type: "fill",
      "source-layer": "country_boundaries",
      paint: {
        "fill-color": statusColors.Unknown,
        "fill-opacity": 0.8,
      },
    },
    overlayLayer: {
      id: "countries-second-view",
      type: "fill",
      "source-layer": "country_boundaries",
      paint: {
        "fill-color": statusColors.Unknown,
        "fill-opacity": 0,
      },
    },
  },
  onFeatureClick: ({ event }) => {
    const activeDrug = Object.keys(tileData)[0];
    if (!activeDrug) return;

    showCountryPopup(event, activeDrug);
    setTimeout(() => popup.remove(), 3000);
  },
});

function updateMapColors(drugKey) {
  const drugData = tileData[drugKey];
  if (!map.getLayer("countries-second-view") || !drugData) return;

  const colorMap = Object.fromEntries(
    Object.entries(drugData).map(([code, obj]) => {
      const status = obj?.access_status || "Unknown";
      return [code, statusColors[status] || statusColors.Unknown];
    })
  );

  updateFillColors({
    colorMap,
    defaultColor: statusColors.Unknown,
  });
}

// --- Dark Mode ---
const hour = new Date().getHours();
if (hour >= 19 || hour < 7) document.body.classList.add("dark-mode");

// --- Country Hover / Click Popups ---
const popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
  maxWidth: "240px",
});

function showCountryPopup(event, drugKey) {
  const iso = event.features?.[0]?.properties?.iso_3166_1?.slice(0, 2);
  if (!iso || !tileData[drugKey]) return;

  const entry = tileData[drugKey][iso];
  if (!entry) return;

  const { access_status, reference_link } = entry;

  if (access_status == "Unknown") return;

  const html = `
    <div class="country-popup">
      <strong>${iso}</strong><br>
      Status: ${access_status}<br>
      ${
        reference_link
          ? `<a href="${reference_link}" target="_blank" class="popup-link">Reference</a>`
          : `<span class="popup-no-link">No reference</span>`
      }
    </div>
  `;

  popup.setLngLat(event.lngLat).setHTML(html).addTo(map);
}

// --- Search tile handlers ---
document.addEventListener("DOMContentLoaded", () => {
  const legendContainer = document.getElementById("legend");
  const { root: legend } = createMapLegend({ statusColors });
  legend.id = "legend";
  legendContainer.replaceWith(legend);

  const tilesContainer = document.getElementById("tilesContainer");
  const searchTileElements = createSearchTile();
  tilesContainer.appendChild(searchTileElements.root);

  const controller = new SearchTileController({
    ...searchTileElements,
    onSubmit: async (query) => {
      const { input } = searchTileElements;
      const searchInput = input;

      try {
        const {
          success,
          message,
          labelText,
          standardizedKey,
          countryStatusMap,
        } = await fetchDrugStatus(query);

        if (!success) {
          searchInput.value = message || `No known record of '${query}'`;
          searchInput.focus();
          return;
        }

        tileData[standardizedKey] = countryStatusMap;

        if (countryStatusMap && Object.keys(countryStatusMap).length > 0) {
          updateMapColors(standardizedKey);

          controller.setLabel(labelText);

          controller.pulseActive();
        } else {
          alert(`"${standardizedKey}" was processed, but no map data is available yet.`);
        }
      } catch (err) {
        console.error("Search failed:", err);
        alert(`Failed to fetch data for "${query}". Please try again later.`);
      }
    },
  });
});

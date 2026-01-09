import { createMap } from "map-ui-common/map-core";
import { loadMapboxAssets } from "map-ui-common/map-core/mapbox-assets";
import {
  configureMapboxAccessToken,
  getMapboxViewportConfig,
} from "map-ui-common/map-core/mapbox-setup";
import { createSearchTile, SearchTileController } from "map-ui-common/ui/search-tile";
import { buildLegend as buildLegendUI } from "map-ui-common/ui/legend";
import { createCountryPopup } from "map-ui-common/ui/country-popup";
import { fetchDrugStatus } from "./src/adapters/drugDataAdapter.js";

await loadMapboxAssets();

configureMapboxAccessToken({
  localToken:
    "pk.eyJ1IjoiYm5jNHZrIiwiYSI6ImNtZmtuNzExZTBma2YyaXB5N2V3cnNqZHYifQ.81pi_QteF8dXpaLdAgAcbA",
  prodToken:
    "pk.eyJ1IjoiYm5jNHZrIiwiYSI6ImNtZmttd2l0NDBlcmgybXB6engyZ3NsOXMifQ.ispasH40DZiTItGPC7EuQQ",
});

const { center: mapCenter, zoom: zoomLevel } = getMapboxViewportConfig();

// --- Configurations ---
const statusColors = {
  Unknown: "#666666",
  Banned: "#e74c3c",
  "Limited Access Trials": "#f1c40f",
  "Approved Medical Use": "#27ae60",
};

let tileData = {}; // populated from server response
let activeDrugKey = null;

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
    if (!activeDrugKey) return;
    showCountryPopup(event);
    setTimeout(() => popup.remove(), 3000);
  },
});

const { popup, showPopup: showCountryPopup } = createCountryPopup({
  map,
  getEntry: (iso) => tileData[activeDrugKey]?.[iso],
  hideWhen: (entry) => entry?.access_status === "Unknown",
  renderHtml: ({ iso, entry }) => {
    const { access_status, reference_link } = entry;
    return `
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
  },
});

function updateMapColors(drugKey) {
  const drugData = tileData[drugKey];
  if (!map.getLayer("countries-second-view") || !drugData) return;
  activeDrugKey = drugKey;

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

// --- Legend ---
function buildLegend() {
  const items = Object.entries(statusColors).map(([label, color]) => ({
    label,
    color,
  }));

  buildLegendUI({ containerId: "legend", items });
}

// --- Search tile handlers ---
document.addEventListener("DOMContentLoaded", () => {
  buildLegend();

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

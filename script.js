import { createMap } from "./map-core/map-core.js";

// --- Mapbox Setup ---
const isLocalhost = window.location.hostname === "localhost";

mapboxgl.accessToken = isLocalhost
  ? "pk.eyJ1IjoiYm5jNHZrIiwiYSI6ImNtZmtuNzExZTBma2YyaXB5N2V3cnNqZHYifQ.81pi_QteF8dXpaLdAgAcbA"
  : "pk.eyJ1IjoiYm5jNHZrIiwiYSI6ImNtZmttd2l0NDBlcmgybXB6engyZ3NsOXMifQ.ispasH40DZiTItGPC7EuQQ";

const isMobile = window.innerWidth <= 500;
const mapCenter = isMobile ? [-40, 20] : [10, 20];
const zoomLevel = isMobile ? 0.8 : 1.3;

// --- Configurations ---
const statusColors = {
  Unknown: "#666666",
  Banned: "#e74c3c",
  "Limited Access Trials": "#f1c40f",
  "Approved Medical Use": "#27ae60",
};

let tileData = {}; // Will now be populated from server response directly

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
  if (!iso || !tileData[drugKey] ) return;

  const entry = tileData[drugKey][iso];
  if (!entry) return;

  const { access_status, reference_link } = entry;

  if (access_status == 'Unknown') return;

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

// --- Legend ---
function buildLegend() {
  const legendContainer = document.getElementById("legend");
  legendContainer.innerHTML = "";
  Object.entries(statusColors).forEach(([status, color]) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    const colorBox = document.createElement("span");
    colorBox.className = "legend-color";
    colorBox.style.backgroundColor = color;
    const label = document.createElement("span");
    label.className = "legend-label";
    label.textContent = status;
    item.appendChild(colorBox);
    item.appendChild(label);
    legendContainer.appendChild(item);
  });
}

// --- Search tile helpers ---
function setSearchExpanded(expanded, searchTile, searchForm, iconWrap, searchInput) {
  searchTile.classList.toggle("expanded", expanded);
  iconWrap.classList.toggle("hidden", expanded);
  searchForm.classList.toggle("hidden", !expanded);
  if (expanded) setTimeout(() => searchInput.focus(), 50);
}

function setSearchLabel(labelText, iconWrap) {
  iconWrap.innerHTML = "";
  const label = document.createElement("span");
  label.className = "substance-label";
  label.textContent = labelText;
  iconWrap.appendChild(label);
}

// --- Search tile handlers ---
document.addEventListener("DOMContentLoaded", () => {
  buildLegend();

  const searchTile = document.querySelector(".search-tile");
  const iconWrap = searchTile.querySelector(".search-icon-wrap");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  iconWrap.addEventListener("click", (ev) => {
    ev.stopPropagation();
    setSearchExpanded(true, searchTile, searchForm, iconWrap, searchInput);
  });

  searchForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    const button = document.getElementById("searchButton");
    const spinner = button.querySelector(".spinner");

    const spinnerTimeout = setTimeout(() => {
      spinner.classList.remove("hidden");
    }, 1000);

    try {
      const RENDER_BACKEND_URL = isLocalhost
        ? "http://localhost:3000"
        : "https://render-backend-g0u7.onrender.com";
      const response = await fetch(`${RENDER_BACKEND_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data && data.success === false) {
        searchInput.value = data.message || `No known record of '${query}'`;
        searchInput.focus();
        return;
      }

      const standardizedKey = data.normalizedSubstance;
      const labelText = data.resolved_name || standardizedKey;

      // Transform server data array into map-friendly object
      tileData[standardizedKey] = Object.fromEntries(
        (data.data || []).map(({ country_code, access_status, reference_link }) => [
          country_code,
          { access_status, reference_link }
        ])
      );

      if (tileData[standardizedKey] && Object.keys(tileData[standardizedKey]).length > 0) {
        updateMapColors(standardizedKey);

        setSearchLabel(labelText, iconWrap);

        searchTile.classList.add("active");
        setTimeout(() => searchTile.classList.remove("active"), 1200);
      } else {
        alert(`"${standardizedKey}" was processed, but no map data is available yet.`);
      }
    } catch (err) {
      console.error("Search failed:", err);
      alert(`Failed to fetch data for "${query}". Please try again later.`);
    } finally {
      clearTimeout(spinnerTimeout);
      spinner.classList.add("hidden");
      setSearchExpanded(false, searchTile, searchForm, iconWrap, searchInput);
    }
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && !searchForm.classList.contains("hidden")) {
      setSearchExpanded(false, searchTile, searchForm, iconWrap, searchInput);
    }
  });
});

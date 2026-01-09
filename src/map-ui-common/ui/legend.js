export function buildLegend({ containerId, items }) {
  const legendContainer = document.getElementById(containerId);
  if (!legendContainer) {
    throw new Error(`Legend container not found: ${containerId}`);
  }

  legendContainer.innerHTML = "";
  items.forEach(({ label, color }) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    const colorBox = document.createElement("span");
    colorBox.className = "legend-color";
    colorBox.style.backgroundColor = color;
    const labelElement = document.createElement("span");
    labelElement.className = "legend-label";
    labelElement.textContent = label;
    item.appendChild(colorBox);
    item.appendChild(labelElement);
    legendContainer.appendChild(item);
  });
}

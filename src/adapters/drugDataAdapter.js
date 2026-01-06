const isLocalhost = window.location.hostname === "localhost";
const renderBackendUrl = isLocalhost
  ? "http://localhost:3000"
  : "https://render-backend-g0u7.onrender.com";

function normalizeDrugResponse(data) {
  if (!data) {
    return {
      success: false,
      message: "No response data returned.",
      labelText: "",
      standardizedKey: "",
      countryStatusMap: {},
      rawEntries: [],
    };
  }

  const standardizedKey = data.normalizedSubstance;
  const labelText = data.resolved_name || standardizedKey || "";
  const rawEntries = Array.isArray(data.data) ? data.data : [];

  const countryStatusMap = Object.fromEntries(
    rawEntries.map(({ country_code, access_status, reference_link }) => [
      country_code,
      { access_status, reference_link },
    ])
  );

  return {
    success: data.success !== false,
    message: data.message,
    labelText,
    standardizedKey,
    countryStatusMap,
    rawEntries,
  };
}

export async function fetchDrugStatus(query) {
  const response = await fetch(`${renderBackendUrl}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return normalizeDrugResponse(data);
}

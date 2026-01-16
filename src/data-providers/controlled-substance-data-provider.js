const isLocalEnvironment = window.location.hostname === "localhost";
const controlledSubstanceApiBaseUrl = isLocalEnvironment
  ? "http://localhost:3000"
  : "https://render-backend-g0u7.onrender.com";

function normalizeControlledSubstanceResponse(data) {
  if (!data) {
    return {
      success: false,
      message: "No response data returned.",
      substanceLabel: "",
      standardizedSubstanceKey: "",
      countryStatusByCode: {},
      rawAccessEntries: [],
    };
  }

  const standardizedSubstanceKey = data.normalizedSubstance;
  const substanceLabel = data.resolved_name || standardizedSubstanceKey || "";
  const rawAccessEntries = Array.isArray(data.data) ? data.data : [];

  const countryStatusByCode = Object.fromEntries(
    rawAccessEntries.map(({ country_code, access_status, reference_link }) => [
      country_code,
      { access_status, reference_link },
    ])
  );

  return {
    success: data.success !== false,
    message: data.message,
    substanceLabel,
    standardizedSubstanceKey,
    countryStatusByCode,
    rawAccessEntries,
  };
}

export async function fetchControlledSubstanceStatus(query) {
  const response = await fetch(`${controlledSubstanceApiBaseUrl}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return normalizeControlledSubstanceResponse(data);
}

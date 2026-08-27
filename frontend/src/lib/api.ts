const API_BASE_URL = "http://127.0.0.1:8000";

export async function getOverviewMetrics() {
  const response = await fetch(
    `${API_BASE_URL}/api/overview`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch overview metrics");
  }

  return response.json();
}
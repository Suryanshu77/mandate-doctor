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

export async function getAnalytics() {
  const response = await fetch(
    `${API_BASE_URL}/api/metrics/analytics`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return response.json();
}

export async function getRecoveryCases() {
  const response = await fetch(
    `${API_BASE_URL}/api/cases`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recovery cases");
  }

  return response.json();
}

export async function submitApproval(
  paymentId: string,
  decision: "APPROVE" | "REJECT"
) {
  const response = await fetch(`${API_BASE_URL}/api/approvals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_id: paymentId,
      decision,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit approval");
  }

  return response.json();
}

export async function getAuditLogs() {
  const response = await fetch(
    `${API_BASE_URL}/api/audit`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch audit logs");
  }

  return response.json();
}

export interface Settings {
  retry_limit: number;
  cooling_off_hours: number;
  human_approval_threshold: number;
  max_contact_attempts: number;
  kill_switch: boolean;
}

export async function getSettings(): Promise<Settings> {
  const response = await fetch(
    `${API_BASE_URL}/api/settings`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch settings");
  }

  return response.json();
}

export async function updateSettings(
  settings: Settings
): Promise<Settings> {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error("Failed to save settings");
  }

  return response.json();
}
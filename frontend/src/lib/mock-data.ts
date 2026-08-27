export type CaseStatus = "Recovered" | "Pending" | "Escalated" | "Blocked" | "Uncollectable";
export type RecoveryCase = {
  id: string; payment: string; customer: string; amount: string; failure: string; diagnosis: string;
  action: string; status: CaseStatus; probability: number; history: string;
};

export const cases: RecoveryCase[] = [
  { id: "RC-2048", payment: "PAY-89320", customer: "Aarav Mehta", amount: "₹84,000", failure: "Limit Exceeded", diagnosis: "Daily debit ceiling reached", action: "Retry at 09:30 tomorrow", status: "Pending", probability: 86, history: "18 successful · 1 failed" },
  { id: "RC-2047", payment: "PAY-89319", customer: "Neha Kapoor", amount: "₹24,900", failure: "Balance", diagnosis: "Temporary balance shortfall", action: "Smart retry completed", status: "Recovered", probability: 94, history: "32 successful · 2 failed" },
  { id: "RC-2046", payment: "PAY-89318", customer: "Vikram Shah", amount: "₹1,28,000", failure: "Revoked Mandate", diagnosis: "Customer revoked authorization", action: "Request fresh mandate", status: "Escalated", probability: 61, history: "11 successful · 3 failed" },
  { id: "RC-2045", payment: "PAY-89317", customer: "Ishita Rao", amount: "₹12,500", failure: "Bank Timeout", diagnosis: "Issuer response timeout", action: "Retried after cooling-off", status: "Recovered", probability: 91, history: "9 successful · 1 failed" },
  { id: "RC-2044", payment: "PAY-89316", customer: "Karan Bedi", amount: "₹2,40,000", failure: "Expired Mandate", diagnosis: "Mandate expired 3 days ago", action: "Blocked by amount policy", status: "Blocked", probability: 72, history: "26 successful · 1 failed" },
  { id: "RC-2043", payment: "PAY-89315", customer: "Maya Iyer", amount: "₹8,400", failure: "Balance", diagnosis: "Persistent insufficient funds", action: "Recovery sequence exhausted", status: "Uncollectable", probability: 18, history: "4 successful · 7 failed" },
];

export const trendData = [
  { day: "19 Aug", doctor: 42, naive: 18 }, { day: "20 Aug", doctor: 56, naive: 25 },
  { day: "21 Aug", doctor: 51, naive: 27 }, { day: "22 Aug", doctor: 74, naive: 31 },
  { day: "23 Aug", doctor: 68, naive: 34 }, { day: "24 Aug", doctor: 92, naive: 38 },
  { day: "25 Aug", doctor: 108, naive: 43 },
];

export const rootCauses = [
  { name: "Balance", value: 38, fill: "var(--chart-1)" }, { name: "Bank Timeout", value: 24, fill: "var(--chart-2)" },
  { name: "Limit Exceeded", value: 18, fill: "var(--chart-3)" }, { name: "Expired Mandate", value: 12, fill: "var(--chart-4)" },
  { name: "Revoked", value: 8, fill: "var(--chart-5)" },
];

export type CaseStatus = "Recovered" | "Pending" | "Escalated" | "Blocked" | "Uncollectable";
export type RecoveryCase = {
  id: string; payment: string; customer: string; amount: string; failure: string; diagnosis: string;
  action: string; status: CaseStatus; probability: number; history: string;
};

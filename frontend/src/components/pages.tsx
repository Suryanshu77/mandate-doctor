import { Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowRight, BrainCircuit, Check, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Download, Filter, Gauge, History, Pause, Play, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Sparkles, TrendingUp, UserCheck, X, Zap } from "lucide-react";
import { rootCauses, trendData, type RecoveryCase } from "../lib/mock-data";
import { Badge, Button, Metric, PageHeader, Panel } from "./ui";
import {
  getAnalytics,
  getAuditLogs,
  getOverviewMetrics,
  getRecoveryCases,
  getSettings,
  submitApproval,
  updateSettings,
  type Settings,
} from "../lib/api";

const tipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };
const funnel = [{ label: "Failed", value: "2,847", width: "100%" }, { label: "Diagnosed", value: "2,731", width: "85%" }, { label: "Action taken", value: "1,924", width: "68%" }, { label: "Recovered", value: "1,316", width: "49%" }];

function Principle() { return <div className="flex items-center gap-3 rounded-lg border border-ai/20 bg-ai-soft px-4 py-3"><BrainCircuit className="size-4 shrink-0 text-ai"/><p className="text-xs text-muted-foreground"><strong className="text-foreground">The AI proposes.</strong> The Policy Engine decides.</p></div>; }
function SectionTitle({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) { return <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4"><div className="min-w-0"><h2 className="text-base font-semibold text-foreground">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{sub}</p></div>{action}</div>; }
function CasesTable({ rows }: { rows: RecoveryCase[] }) { return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[880px] text-left"><thead><tr className="border-b border-border text-[10px] uppercase tracking-[0.1em] text-muted-foreground"><th className="pb-3 font-medium">Payment</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Failure</th><th className="pb-3 font-medium">Diagnosis</th><th className="pb-3 font-medium">Action</th><th className="pb-3 font-medium">Status</th><th/></tr></thead><tbody>{rows.map((c) => <tr key={c.id} className="group border-b border-border/60 text-sm last:border-0 hover:bg-accent/30"><td className="py-4"><p className="font-mono text-xs text-foreground">{c.payment}</p><p className="mt-1 text-[11px] text-muted-foreground">{c.customer}</p></td><td className="py-4 font-medium text-foreground">{c.amount}</td><td className="py-4 text-muted-foreground">{c.failure}</td><td className="max-w-52 py-4 text-muted-foreground">{c.diagnosis}</td><td className="max-w-52 py-4 text-muted-foreground">{c.action}</td><td className="py-4"><Badge status={c.status}/></td><td className="py-4"><Link to="/recovery-cases/$caseId" params={{ caseId: c.id }} aria-label={`View ${c.id}`} className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><ChevronRight className="size-4"/></Link></td></tr>)}</tbody></table></div>; }
function formatRecoveryCase(c: any): RecoveryCase {
  return {
    id: c.payment_id,
    payment: c.payment_id,
    customer: "Customer",
    amount: `₹${Number(c.amount_inr).toLocaleString("en-IN")}`,
    failure: c.diagnosis.root_cause.replaceAll("_", " "),
    diagnosis: c.diagnosis.diagnosis,
    action: c.ai_proposal.proposal,
    status: c.final_decision === "APPROVE" ? "Recovered" : "Blocked",
    history: `${c.previous_successes} previous successes · ${c.previous_failures} previous failures`,
    probability: Math.round(c.recovery_value.recovery_probability * 100),
  };
}

export function OverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<RecoveryCase[]>([]);

  useEffect(() => {
    getOverviewMetrics()
      .then(setMetrics)
      .catch((error) => console.error("Metrics error:", error));

    getRecoveryCases()
      .then((data) =>
        setRecentCases((data.cases || []).slice(0, 5).map(formatRecoveryCase))
      )
      .catch((error) => console.error("Cases error:", error));
  }, []);

  const formatINR = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }

    return `₹${value.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live recovery posture · Demo data"
        title="Good morning, Rohan."
        description="Your recovery engine is operating within policy."
        action={
          <Button variant="secondary">
            <Download className="size-4" />
            Export report
          </Button>
        }
      />

      <section className="relative overflow-hidden rounded-xl border border-border bg-card px-6 py-8 sm:px-8">
        <div className="grid-noise absolute inset-0 opacity-60" />
        <div className="absolute -right-24 -top-32 size-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-danger" />
              <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                Revenue at risk
              </span>
            </div>

            <p className="mt-4 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              {metrics ? formatINR(metrics.revenue_at_risk) : "Loading..."}
            </p>

            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              Revenue currently recoverable across failed recurring payments.
            </p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary-soft p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Recovery opportunity
              </p>
              <TrendingUp className="size-4 text-success" />
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-success">
                {metrics ? formatINR(metrics.expected_recovery) : "Loading..."}
              </span>
              <span className="text-xs text-muted-foreground">
                predicted recoverable
              </span>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-success"
                style={{
                  width: `${metrics?.expected_recovery_rate ?? 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Revenue at risk"
          value={metrics ? formatINR(metrics.revenue_at_risk) : "—"}
          change={`${metrics?.total_records ?? "—"} failed mandates`}
        />

        <Metric
          label="Expected recovery"
          value={metrics ? formatINR(metrics.expected_recovery) : "—"}
          change={metrics ? `${metrics.expected_recovery_rate}% expected rate` : "—"}
          tone="success"
        />

        <Metric
          label="Expected unrecovered"
          value={metrics ? formatINR(metrics.expected_unrecovered) : "—"}
          change="Remaining exposure"
          tone="danger"
        />

        <Metric
  label="Approved recoveries"
  value={metrics ? String(metrics.policy_decisions.APPROVE) : "—"}
  change={metrics ? `${metrics.policy_decisions.BLOCK} blocked` : "—"}
/>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.4fr]">
        <Panel>
          <SectionTitle
            title="Recovery funnel"
            sub="Current synthetic dataset"
          />

          <div className="mt-7 space-y-3">
            {funnel.map((item, i) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-5 font-mono text-[10px] text-muted-foreground">
                  0{i + 1}
                </span>

                <div
                  className="relative h-12 overflow-hidden rounded-md border border-border bg-secondary"
                  style={{ width: item.width }}
                >
                  <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-primary/20 to-ai/10" />

                  <div className="relative flex h-full items-center justify-between px-4">
                    <span className="text-xs font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {item.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs">
            <span className="text-muted-foreground">Expected recovery rate</span>
            <span className="font-semibold text-success">
              {metrics ? `${metrics.expected_recovery_rate}%` : "—"}
            </span>
          </div>
        </Panel>

        <Panel>
          <SectionTitle
            title="Recovery performance"
            sub="Mandate Doctor compared with baseline retry"
            action={<Badge status="AI">OPTIMIZED</Badge>}
          />

          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="doctor" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="var(--border)"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                />

                <YAxis
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                />

                <Tooltip contentStyle={tipStyle} />

                <Area
                  type="monotone"
                  dataKey="doctor"
                  stroke="var(--primary)"
                  fill="url(#doctor)"
                  strokeWidth={2}
                />

                <Line
                  type="monotone"
                  dataKey="naive"
                  stroke="var(--muted-foreground)"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <i className="size-2 rounded-full bg-primary" />
              Mandate Doctor
            </span>

            <span className="flex items-center gap-2">
              <i className="size-2 rounded-full bg-muted-foreground" />
              Naive retry
            </span>
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionTitle
          title="Recent recovery cases"
          sub="Latest decisions from the recovery engine"
          action={
            <Link
              to="/recovery-cases"
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              View all cases →
            </Link>
          }
        />

        <CasesTable rows={recentCases} />
      </Panel>
    </div>
  );
}
export function RecoveryCasesPage() {
  const [query, setQuery] = useState("");
  const [casesData, setCasesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecoveryCases()
      .then((data) => setCasesData(data.cases))
      .catch((error) => console.error("Cases error:", error))
      .finally(() => setLoading(false));
  }, []);

  const rows: RecoveryCase[] = casesData
    .filter((c) =>
      `${c.payment_id} ${c.failure_code} ${c.diagnosis.root_cause}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    .map(formatRecoveryCase);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Recovery Cases"
        description="Inspect every failed payment, diagnosis, policy decision, and outcome."
        action={
          <Button>
            <Zap className="size-4" />
            Run recovery batch
          </Button>
        }
      />

      <Principle />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-secondary pl-10 pr-3 text-sm outline-none focus:border-primary/50"
              placeholder="Search payment, customer, or failure..."
            />
          </label>

          <Button variant="secondary">
            <Filter className="size-4" />
            Filters
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading recovery cases...
          </div>
        ) : (
          <CasesTable rows={rows} />
        )}
      </Panel>
    </div>
  );
}
export function CaseReplayPage() {
  const { caseId } = useParams({ strict: false });
  const [caseData, setCaseData] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setCaseData(null);
    setAudit(null);

    Promise.all([getRecoveryCases(), getAuditLogs()])
      .then(([casesData, auditData]) => {
        if (!active) return;
        const found = (casesData.cases || []).find(
          (c: any) => String(c.payment_id) === String(caseId)
        );
        if (!found) {
          setCaseData(null);
          return;
        }
        setCaseData(found);
        const records: any[] = auditData?.records || [];
        const match = [...records]
          .reverse()
          .find((r: any) => String(r.payment_id) === String(caseId));
        setAudit(match || null);
      })
      .catch((err) => {
        console.error("Case replay error:", err);
        if (active) setError("Failed to load the recovery case.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [caseId]);

  const decision = caseData?.final_decision;
  const policy = caseData?.policy || {};
  const action = caseData?.action || {};
  const diagnosis = caseData?.diagnosis || {};
  const proposal = caseData?.ai_proposal || {};
  const recovery = caseData?.recovery_value || {};

  const humanApproval =
    policy.requires_human_approval || decision === "REVIEW";
  const actionExecuted = action.status === "EXECUTED";

  const actionLines: string[] = [];
  if (action.action !== undefined)
    actionLines.push(`Action: ${action.action}`);
  if (action.policy_decision !== undefined)
    actionLines.push(`Policy decision: ${action.policy_decision}`);
  if (action.status !== undefined) actionLines.push(`Status: ${action.status}`);
  if (action.simulated !== undefined)
    actionLines.push(`Simulated: ${action.simulated ? "yes" : "no"}`);
  if (action.message) actionLines.push(`Message: ${action.message}`);
  if (action.retry_after_hours != null)
    actionLines.push(`Retry after: ${action.retry_after_hours}h`);
  if (action.executed_at) actionLines.push(`Executed at: ${action.executed_at}`);

  const actionDetail = humanApproval
    ? "Awaiting human approval. No action is executed until an approval decision is recorded."
    : decision === "BLOCK"
      ? action.message || "Execution skipped: the policy decision was not APPROVE."
      : actionLines.length > 0
        ? actionLines.join(" - ")
        : "No action layer result recorded.";

  const auditStamp = audit?.timestamp || caseData?.audit_id || null;

  const replaySteps = caseData
    ? [
        {
          title: "Payment Failed",
          time: "",
          detail: `Payment ${caseData.payment_id} of ₹${Number(caseData.amount_inr).toLocaleString("en-IN")} failed (${caseData.failure_code || "unknown"}) on attempt ${caseData.attempt_number}.`,
          tone: "failure",
        },
        {
          title: "Diagnosis / Root Cause",
          time: "",
          detail: `${diagnosis.root_cause || "Unknown"}: ${diagnosis.diagnosis || ""}`.trim(),
          tone: "ai",
        },
        {
          title: "AI Proposal",
          time: "",
          detail: proposal.proposal || proposal.action || "Recovery action proposed.",
          tone: "ai",
        },
        {
          title: "Policy Decision",
          time: "",
          detail: `${policy.decision || decision} - ${policy.reason || ""}`.trim(),
          tone: "policy",
        },
        {
          title: "Action Layer Result",
          time: actionExecuted ? (action.executed_at || "") : "",
          detail: actionDetail,
          tone: humanApproval || decision === "BLOCK" ? "pending" : "action",
        },
        {
          title: "Final / Audit Result",
          time: auditStamp || "",
          detail: `${decision || "Decision recorded"}${auditStamp ? `. Audit timestamp: ${auditStamp}.` : ""}`,
          tone: decision === "APPROVE" ? "action" : "pending",
        },
      ]
    : [];

  const probability = Math.round((recovery.recovery_probability || 0) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/recovery-cases" className="hover:text-foreground">
          Recovery Cases
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{caseId || "Case"}</span>
      </div>

      {error ? (
        <Panel>
          <p className="py-12 text-center text-sm text-danger">{error}</p>
        </Panel>
      ) : loading ? (
        <Panel>
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading recovery case...
          </div>
        </Panel>
      ) : !caseData ? (
        <Panel>
          <div className="py-12 text-center text-sm text-muted-foreground">
            No recovery case found for {caseId}.
          </div>
        </Panel>
      ) : (
        <>
          <PageHeader
            eyebrow={`Decision replay · ${caseId}`}
            title={`₹${Number(caseData.amount_inr).toLocaleString("en-IN")} · ${caseData.payment_id}`}
            description="A complete, deterministic replay of how this failed payment was diagnosed and governed."
            action={
              <Badge
                status={
                  decision === "APPROVE"
                    ? "Recovered"
                    : decision === "BLOCK"
                      ? "Blocked"
                      : "Pending"
                }
              >
                {decision || "NO DATA"}
              </Badge>
            }
          />

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <Panel className="p-6">
              <SectionTitle
                title="Recovery decision trace"
                sub="Every step is timestamped and reproducible"
              />

              <div className="mt-7">
                {replaySteps.map((s, i) => (
                  <div key={s.title} className="grid grid-cols-[32px_minmax(0,1fr)] gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`grid size-8 place-items-center rounded-full border ${
                          s.tone === "policy"
                            ? "border-primary/40 bg-primary-soft text-primary"
                            : s.tone === "failure"
                              ? "border-danger/40 bg-danger-soft text-danger"
                              : s.tone === "pending"
                                ? "border-warning/40 bg-warning-soft text-warning"
                                : "border-ai/30 bg-ai-soft text-ai"
                        }`}
                      >
                        {s.tone === "failure" ? (
                          <X className="size-3.5" />
                        ) : s.tone === "policy" ? (
                          <ShieldCheck className="size-3.5" />
                        ) : s.tone === "action" ? (
                          <Zap className="size-3.5" />
                        ) : s.tone === "pending" ? (
                          <Clock3 className="size-3.5" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                      </div>

                      {i < replaySteps.length - 1 && (
                        <div className="my-1 min-h-10 w-px flex-1 bg-border" />
                      )}
                    </div>

                    <div className="pb-7">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-foreground">
                          {s.title}
                        </p>
                        {s.time && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {s.time}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                        {s.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="space-y-4">
              <Panel>
                <p className="eyebrow">AI Agent</p>
                <p className="mt-3 text-sm font-semibold">
                  Proposes the best action
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {proposal.proposal || proposal.action || "No proposal recorded."}
                </p>
              </Panel>

              <Panel className="border-primary/30">
                <p className="eyebrow">Policy Engine</p>
                <p className="mt-3 text-sm font-semibold">
                  Decides what is allowed
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {policy.reason ||
                    (decision === "APPROVE"
                      ? "Action is within policy."
                      : "Action is outside policy.")}
                  {humanApproval ? " This case requires a human." : ""}
                </p>
              </Panel>

              <Panel>
                <p className="eyebrow">Action Layer</p>
                <p className="mt-3 text-sm font-semibold">
                  {humanApproval
                    ? "Awaiting human approval"
                    : actionExecuted
                      ? "Executed permitted action"
                      : "Execution skipped"}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {actionDetail}
                </p>
              </Panel>

              <Panel>
                <p className="text-xs text-muted-foreground">
                  Recovery probability
                </p>
                <p className="mt-2 text-3xl font-semibold text-success">
                  {probability}%
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${probability}%` }}
                  />
                </div>
              </Panel>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export function ApprovalsPage() {
  const [pendingCases, setPendingCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getRecoveryCases()
      .then((data) => setPendingCases(data.cases || []))
      .catch((error) => console.error("Approvals loading error:", error))
      .finally(() => setLoading(false));
  }, []);

  const pending = (pendingCases || []).filter(
    (c) =>
      (c.final_decision === "BLOCK" || c.final_decision === "REVIEW") &&
      !c.human_approval
  );

  const refreshCases = () => {
    getRecoveryCases()
      .then((data) => setPendingCases(data.cases || []))
      .catch((error) => console.error("Approvals reload error:", error));
  };

  const handleDecision = async (paymentId: string, decision: "APPROVE" | "REJECT") => {
    setBusyId(paymentId);
    setErrors((prev) => ({ ...prev, [paymentId]: "" }));
    try {
      await submitApproval(paymentId, decision);
      setCompleted((prev) => [...prev, paymentId]);
      refreshCases();
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        [paymentId]: error?.message || "Request failed. Please try again.",
      }));
    } finally {
      setBusyId(null);
    }
  };

  const inr = (n: number) => "₹" + Number(n || 0).toLocaleString("en-IN");
  const expectedValue = (c: any) =>
    "₹" + Math.round((c.recovery_value?.amount_at_risk || 0) * (c.recovery_value?.recovery_probability || 0)).toLocaleString("en-IN");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Human-in-the-loop"
        title="Approval Queue"
        description="High-value or policy-sensitive recovery actions waiting for an accountable decision."
        action={
          <div className="text-right">
            <p className="text-2xl font-semibold text-warning">
              {inr(pending.reduce((s, c) => s + (c.recovery_value?.amount_at_risk || 0), 0))}
            </p>
            <p className="text-[11px] text-muted-foreground">value awaiting review</p>
          </div>
        }
      />
      <Principle />
      <div className="space-y-4">
        {loading ? (
          <Panel>
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading approval queue...
            </div>
          </Panel>
        ) : pending.length === 0 ? (
          <Panel>
            <div className="py-12 text-center text-sm text-muted-foreground">
              No approval decisions currently required.
            </div>
          </Panel>
        ) : (
          pending.map((c) => (
            <Panel key={c.payment_id} className="overflow-hidden p-0">
              <div className="grid lg:grid-cols-[220px_1fr_220px]">
                <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
                  <p className="font-mono text-[10px] text-muted-foreground">{c.payment_id}</p>
                  <p className="mt-3 text-3xl font-semibold">{inr(c.amount_inr)}</p>
                  <p className="mt-2 text-sm text-foreground">{c.diagnosis?.root_cause?.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.previous_successes} successes · {c.previous_failures} failures
                  </p>
                </div>
                <div className="grid gap-5 p-6 sm:grid-cols-2">
                  <div>
                    <p className="eyebrow">Failure reason</p>
                    <p className="mt-2 text-sm text-foreground">{c.diagnosis?.root_cause?.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.diagnosis?.diagnosis}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Expected recovery</p>
                    <p className="mt-2 text-sm text-success">
                      {Math.round((c.recovery_value?.recovery_probability || 0) * 100)}% probability
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {expectedValue(c)} expected value
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">AI recommendation</p>
                    <p className="mt-2 text-sm text-foreground">{c.ai_proposal?.proposal}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Policy reason</p>
                    <p className="mt-2 text-sm text-foreground">{c.policy?.reason}</p>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-2 border-t border-border p-6 lg:flex-col lg:justify-center lg:border-l lg:border-t-0">
                  {completed.includes(c.payment_id) ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-success">
                      <CheckCircle2 className="size-5" />
                      Decision recorded
                    </div>
                  ) : (
                    <>
                      <Button
                        className="flex-1 lg:w-full"
                        disabled={busyId === c.payment_id}
                        onClick={() => handleDecision(c.payment_id, "APPROVE")}
                      >
                        <Check className="size-4" />
                        {busyId === c.payment_id ? "Submitting..." : "Approve"}
                      </Button>
                      <Button
                        variant="danger"
                        className="flex-1 lg:w-full"
                        disabled={busyId === c.payment_id}
                        onClick={() => handleDecision(c.payment_id, "REJECT")}
                      >
                        <X className="size-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {errors[c.payment_id] && (
                    <p className="mt-2 text-xs text-danger">{errors[c.payment_id]}</p>
                  )}
                </div>
              </div>
            </Panel>
          ))
        )}
      </div>
    </div>
  );
}


export function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((e) => {
        setError("Failed to load analytics.");
        console.error("Analytics error:", e);
      })
      .finally(() => setLoading(false));
  }, []);

  const fmtLakh = (n: number) =>
    "₹" +
    (Number(n || 0) / 100000).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) +
    "L";

  const palette = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--primary)",
    "var(--ai)",
    "var(--warning)",
  ];

  const rootCauses = data
    ? Object.entries(data.diagnosis_counts || {}).map(
        ([key, val]: any, idx: number) => ({
          name: key
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          value: Math.round((val / (data.total_records || 1)) * 100),
          fill: palette[idx % palette.length],
        })
      )
    : [];

  const trend = data?.recovery_trend || [];

  const approvedRate = data
    ? ((data.approved_recoveries / (data.total_records || 1)) * 100).toFixed(1)
    : "0";

  const blockedRate = data
    ? ((data.blocked_recoveries / (data.total_records || 1)) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Executive intelligence · Last 30 days"
        title="Recovery Analytics"
        description="Revenue outcomes, model uplift, root causes, and policy health across the recovery portfolio."
        action={<Button variant="secondary"><Download className="size-4" />Download PDF</Button>}
      />

      {loading ? (
        <Panel>
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading analytics...
          </div>
        </Panel>
      ) : error ? (
        <Panel>
          <p className="py-12 text-center text-sm text-danger">{error}</p>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Revenue at risk" value={fmtLakh(data.revenue_at_risk)} change={`${data.total_records} records`} />
            <Metric label="Revenue recovered" value={fmtLakh(data.expected_recovery)} change="expected recovery" tone="success" />
            <Metric label="Recovery rate" value={`${data.expected_recovery_rate}%`} change="of revenue at risk" />
            <Metric label="Recovery uplift" value={`${approvedRate}%`} change="approved recovery rate" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Panel>
              <SectionTitle title="Recovery trend" sub="Recovered value indexed against baseline" />
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={10} />
                    <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={10} />
                    <Tooltip contentStyle={tipStyle} />
                    <Line type="monotone" dataKey="doctor" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: "var(--primary)", r: 3 }} />
                    <Line type="monotone" dataKey="naive" stroke="var(--muted-foreground)" strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel>
              <SectionTitle title="Root-cause distribution" sub="Share of total failures" />
              <div className="mt-4 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={rootCauses} innerRadius={58} outerRadius={82} paddingAngle={3} dataKey="value">
                      {rootCauses.map((r) => <Cell key={r.name} fill={r.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={tipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {rootCauses.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <i className="size-2 rounded-full" style={{ background: r.fill }} />
                      {r.name}
                    </span>
                    <span className="font-mono text-foreground">{r.value}%</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Panel>
              <p className="text-xs text-muted-foreground">Uncollectable cases</p>
              <p className="mt-3 text-2xl font-semibold">{data.blocked_recoveries}</p>
              <p className="mt-2 text-xs text-danger">{blockedRate}% of records</p>
            </Panel>
            <Panel>
              <p className="text-xs text-muted-foreground">Policy violations prevented</p>
              <p className="mt-3 text-2xl font-semibold">{data.blocked_recoveries}</p>
              <p className="mt-2 text-xs text-success">{fmtLakh(data.blocked_at_risk)} exposure avoided</p>
            </Panel>
            <Panel>
              <p className="text-xs text-muted-foreground">Median recovery time</p>
              <p className="mt-3 text-2xl font-semibold">19.4h</p>
              <p className="mt-2 text-xs text-success">↑4.1h from baseline</p>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}


export function AuditReplayPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAuditLogs()
      .then((data) => {
        setLogs(data.records || []);

        if (data.records?.length) {
          setSelected(data.records[data.records.length - 1]);
        }
      })
      .catch((error) => {
        setError("Failed to load audit records.");
        console.error("Audit error:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const actionLines =
    selected?.action &&
    (selected.action.action !== undefined ||
      selected.action.status !== undefined)
      ? [
          selected.action.action !== undefined
            ? `Action: ${selected.action.action}`
            : null,
          selected.action.status !== undefined
            ? `Status: ${selected.action.status}`
            : null,
          selected.action.simulated !== undefined
            ? `Simulated: ${selected.action.simulated ? "yes" : "no"}`
            : null,
          selected.action.message
            ? `Message: ${selected.action.message}`
            : null,
          selected.action.retry_after_hours != null
            ? `Retry after: ${selected.action.retry_after_hours}h`
            : null,
        ].filter(Boolean)
      : ["No action layer result recorded."];

  const replaySteps = selected
    ? [
        {
          title: "Payment Failure",
          detail: `Payment ${selected.payment_id} failed and entered recovery.`,
          tone: "failure",
        },
        {
          title: "Diagnosis",
          detail: selected.diagnosis?.diagnosis || "Failure diagnosed.",
          tone: "ai",
        },
        {
          title: "AI Proposal",
          detail:
            selected.ai_proposal?.proposal || "Recovery action proposed.",
          tone: "ai",
        },
        {
          title: "Policy Decision",
          detail:
            selected.policy?.reason || "Policy engine evaluated the action.",
          tone: "policy",
        },
        {
          title: "Final Decision",
          detail: selected.final_decision
            ? `Recovery decision: ${selected.final_decision}`
            : selected.decision
              ? `Human decision: ${selected.decision}`
              : "Decision recorded.",
          tone: "pending",
        },
        {
          title: "Action Result",
          detail: "Action Layer outcome",
          tone: "result",
          lines: actionLines,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Immutable decision ledger"
        title="Audit Replay"
        description="Search and replay every inference, rule evaluation, action, and financial outcome."
        action={
          <Badge
            status={
              selected?.final_decision === "APPROVE" ||
              selected?.decision === "APPROVE"
                ? "Success"
                : "Pending"
            }
          >
            {selected ? selected.final_decision || selected.decision : "NO TRACE"}
          </Badge>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selected ? String(logs.indexOf(selected)) : ""}
            onChange={(e) => {
              setSelected(logs[Number(e.target.value)] || null);
            }}
            className="h-10 flex-1 rounded-lg border border-border bg-secondary px-3 text-sm outline-none"
          >
            <option value="">Select audit record</option>

            {logs.map((log, index) => (
              <option key={`${log.payment_id}-${index}`} value={String(index)}>
                {log.payment_id}
              </option>
            ))}
          </select>

          <Button
            onClick={() => setPlaying(!playing)}
            disabled={!selected}
          >
            {playing ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            {playing ? "Pause replay" : "Replay decision"}
          </Button>
        </div>
      </Panel>

      {error ? (
        <Panel>
          <p className="py-12 text-center text-sm text-danger">
            {error}
          </p>
        </Panel>
      ) : loading ? (
        <Panel>
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading audit records...
          </div>
        </Panel>
      ) : !selected ? (
        <Panel>
          <div className="py-12 text-center text-sm text-muted-foreground">
            No audit records available.
          </div>
        </Panel>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          <Panel>
            <SectionTitle
              title="Decision timeline"
              sub={`Trace ${selected.payment_id}`}
            />

            <div className="mt-6 space-y-1">
              {replaySteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`grid grid-cols-[20px_minmax(0,1fr)] gap-3 rounded-lg p-3 transition-all ${
                    playing ? "bg-accent" : ""
                  }`}
                >
                  <div className="relative flex justify-center">
                    <span
                      className={`mt-1.5 size-2 rounded-full ${
                        step.tone === "failure"
                          ? "bg-danger"
                          : step.tone === "policy"
                            ? "bg-primary"
                            : step.tone === "ai"
                              ? "bg-ai"
                              : step.tone === "result"
                                ? "bg-success"
                                : "bg-warning"
                      }`}
                    />

                    {index < replaySteps.length - 1 && (
                      <span className="absolute top-4 h-12 w-px bg-border" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {step.title}
                    </p>

                    {step.lines ? (
                      step.lines.map((line, i) => (
                        <p
                          key={i}
                          className="mt-1 text-xs leading-5 text-muted-foreground"
                        >
                          {line}
                        </p>
                      ))
                    ) : (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <History className="size-5 text-primary" />

              <p className="mt-4 text-sm font-semibold">
                Deterministic replay
              </p>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Inputs, model proposal, policy decision, and final outcome
                are preserved together.
              </p>
            </Panel>

            <Panel>
              <p className="eyebrow">Final decision</p>

              <div className="mt-4">
                <Badge
                  status={
                    selected.final_decision === "APPROVE" ||
                    selected.decision === "APPROVE"
                      ? "Success"
                      : "Pending"
                  }
                >
                  {selected.final_decision || selected.decision}
                </Badge>
              </div>

              <p className="mt-3 break-all font-mono text-[9px] text-muted-foreground">
                {selected.timestamp}
              </p>
            </Panel>

            <Panel>
              <p className="eyebrow">Audit integrity</p>

              <div className="mt-4 flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="size-4" />
                Trace verified
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
export function SettingsPage() {
  const [kill, setKill] = useState(false);
  const [settings, setSettings] = useState({ retry: 3, cooling: 12, threshold: 75000, contacts: 2 });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const update = (key: keyof typeof settings, v: number) => setSettings({ ...settings, [key]: v });

  useEffect(() => {
    let active = true;
    getSettings().then((loaded) => {
      if (!active) return;
      setSettings({
        retry: loaded.retry_limit,
        cooling: loaded.cooling_off_hours,
        threshold: loaded.human_approval_threshold,
        contacts: loaded.max_contact_attempts,
      });
      setKill(loaded.kill_switch);
    }).catch(() => {
      if (active) setStatus("error");
    });
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    setStatus("saving");
    try {
      await updateSettings({
        retry_limit: settings.retry,
        cooling_off_hours: settings.cooling,
        human_approval_threshold: settings.threshold,
        max_contact_attempts: settings.contacts,
        kill_switch: kill,
      });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Policy controls"
        title="Recovery Settings"
        description="Configure deterministic guardrails that govern every AI-proposed recovery action."
        action={
          <div className="flex items-center gap-3">
            {status === "saved" && <span className="text-xs text-emerald-500">Saved</span>}
            {status === "error" && <span className="text-xs text-danger">Failed to save</span>}
            <Button onClick={handleSave} disabled={status === "saving"}>
              <Check className="size-4" />
              {status === "saving" ? "Saving…" : "Save changes"}
            </Button>
          </div>
        }
      />
      <Principle />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel>
          <SectionTitle title="Recovery policy" sub="Version 2.4 · applies to all active mandates" />
          <div className="mt-6 divide-y divide-border">
            {[
              { key: "retry", label: "Retry limit", sub: "Maximum automated attempts per failed payment", suffix: "attempts" },
              { key: "cooling", label: "Cooling-off period", sub: "Minimum delay between recovery attempts", suffix: "hours" },
              { key: "threshold", label: "Human approval threshold", sub: "Payments above this value require approval", suffix: "₹" },
              { key: "contacts", label: "Maximum contact attempts", sub: "Customer messages allowed per recovery cycle", suffix: "messages" },
            ].map((row) => (
              <div key={row.key} className="grid grid-cols-[minmax(0,1fr)_150px] items-center gap-5 py-5">
                <div>
                  <label htmlFor={row.key} className="text-sm font-medium text-foreground">{row.label}</label>
                  <p className="mt-1 text-xs text-muted-foreground">{row.sub}</p>
                </div>
                <div className="flex items-center rounded-lg border border-border bg-secondary">
                  <input
                    id={row.key}
                    type="number"
                    value={settings[row.key as keyof typeof settings]}
                    onChange={(e) => update(row.key as keyof typeof settings, Number(e.target.value))}
                    className="h-10 min-w-0 flex-1 bg-transparent px-3 text-right font-mono text-sm outline-none"
                  />
                  <span className="pr-3 text-[10px] text-muted-foreground">{row.suffix}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel className={kill ? "border-danger/50" : ""}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Recovery kill switch</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Immediately prevent all queued and new recovery actions.</p>
              </div>
              <button
                onClick={() => setKill(!kill)}
                role="switch"
                aria-checked={kill}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${kill ? "bg-danger" : "bg-muted"}`}
              >
                <span className={`absolute top-1 size-4 rounded-full bg-foreground transition-transform ${kill ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            {kill && (
              <div className="mt-4 rounded-lg border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
                Recovery execution is paused.
              </div>
            )}
          </Panel>
          <Panel>
            <ShieldCheck className="size-5 text-primary" />
            <p className="mt-4 text-sm font-semibold">Policy-first execution</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">AI recommendations cannot bypass limits, approval thresholds, cooldowns, or contact policies.</p>
          </Panel>
          <Panel>
            <p className="eyebrow">Environment</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm">Simulation mode</span>
              <Badge status="Test">ACTIVE</Badge>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">All values and outcomes in this prototype are mock data.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

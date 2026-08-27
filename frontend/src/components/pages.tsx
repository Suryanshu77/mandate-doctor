import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowRight, BrainCircuit, Check, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Download, Filter, Gauge, History, Pause, Play, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Sparkles, TrendingUp, UserCheck, X, Zap } from "lucide-react";
import { cases, rootCauses, trendData, type RecoveryCase } from "../lib/mock-data";
import { Badge, Button, Metric, PageHeader, Panel } from "./ui";
import {
  getAuditLogs,
  getOverviewMetrics,
  getRecoveryCases,
  submitApproval,
} from "../lib/api";

const tipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };
const funnel = [{ label: "Failed", value: "2,847", width: "100%" }, { label: "Diagnosed", value: "2,731", width: "85%" }, { label: "Action taken", value: "1,924", width: "68%" }, { label: "Recovered", value: "1,316", width: "49%" }];

function Principle() { return <div className="flex items-center gap-3 rounded-lg border border-ai/20 bg-ai-soft px-4 py-3"><BrainCircuit className="size-4 shrink-0 text-ai"/><p className="text-xs text-muted-foreground"><strong className="text-foreground">The AI proposes.</strong> The Policy Engine decides.</p></div>; }
function SectionTitle({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) { return <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4"><div className="min-w-0"><h2 className="text-base font-semibold text-foreground">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{sub}</p></div>{action}</div>; }
function CasesTable({ rows = cases }: { rows?: RecoveryCase[] }) { return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[880px] text-left"><thead><tr className="border-b border-border text-[10px] uppercase tracking-[0.1em] text-muted-foreground"><th className="pb-3 font-medium">Payment</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Failure</th><th className="pb-3 font-medium">Diagnosis</th><th className="pb-3 font-medium">Action</th><th className="pb-3 font-medium">Status</th><th/></tr></thead><tbody>{rows.map((c) => <tr key={c.id} className="group border-b border-border/60 text-sm last:border-0 hover:bg-accent/30"><td className="py-4"><p className="font-mono text-xs text-foreground">{c.payment}</p><p className="mt-1 text-[11px] text-muted-foreground">{c.customer}</p></td><td className="py-4 font-medium text-foreground">{c.amount}</td><td className="py-4 text-muted-foreground">{c.failure}</td><td className="max-w-52 py-4 text-muted-foreground">{c.diagnosis}</td><td className="max-w-52 py-4 text-muted-foreground">{c.action}</td><td className="py-4"><Badge status={c.status}/></td><td className="py-4"><Link to="/recovery-cases/$caseId" params={{ caseId: c.id }} aria-label={`View ${c.id}`} className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><ChevronRight className="size-4"/></Link></td></tr>)}</tbody></table></div>; }

export function OverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    getOverviewMetrics()
      .then(setMetrics)
      .catch((error) => console.error("Metrics error:", error));
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

        <CasesTable rows={cases.slice(0, 5)} />
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

  const rows = casesData.filter((c) =>
    `${c.payment_id} ${c.failure_code} ${c.diagnosis.root_cause}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const formattedRows: RecoveryCase[] = rows.map((c) => ({
    id: c.payment_id,
    payment: c.payment_id,
    customer: "Customer",
    amount: `₹${Number(c.amount_inr).toLocaleString("en-IN")}`,
    failure: c.diagnosis.root_cause.replaceAll("_", " "),
    diagnosis: c.diagnosis.diagnosis,
    action: c.ai_proposal.proposal,
    status:
      c.final_decision === "APPROVE"
        ? "Recovered"
        : "Blocked",
    history: `${c.previous_successes} previous successes · ${c.previous_failures} previous failures`,
    probability: Math.round(
      c.recovery_value.recovery_probability * 100
    ),
  }));

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
          <CasesTable rows={formattedRows} />
        )}
      </Panel>
    </div>
  );
}
const steps = [
  ["Payment Failed","02:41:08","Bank returned LIMIT_EXCEEDED","failure"], ["Root Cause Detected","02:41:09","Daily debit ceiling reached; not a permanent mandate failure","ai"],
  ["Customer History Analyzed","02:41:10","18 successful renewals and only one prior soft decline","ai"], ["Recovery Probability","02:41:11","86% likelihood if retried after daily limit resets","ai"],
  ["AI Proposal","02:41:12","Retry once tomorrow at 09:30 IST; suppress customer contact","ai"], ["Policy Decision","02:41:12","Human approval required: amount exceeds ₹75,000 threshold","policy"],
  ["Action Executed","Pending","Queued until approval is recorded","action"], ["Recovery Result","Pending","Awaiting permitted execution","pending"],
];
export function CaseReplayPage() { return <div className="space-y-6"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Link to="/recovery-cases" className="hover:text-foreground">Recovery Cases</Link><ChevronRight className="size-3"/><span className="text-foreground">RC-2048</span></div><PageHeader eyebrow="Decision replay · RC-2048" title="₹84,000 · Aarav Mehta" description="A complete, deterministic replay of how this failed payment was diagnosed and governed." action={<Badge status="Pending"/>}/><div className="grid gap-6 xl:grid-cols-[1fr_320px]"><Panel className="p-6"><SectionTitle title="Recovery decision trace" sub="Every step is timestamped and reproducible" action={<Button variant="secondary"><Play className="size-4"/>Replay</Button>}/><div className="mt-7">{steps.map((s,i)=><div key={s[0]} className="grid grid-cols-[32px_minmax(0,1fr)] gap-4"><div className="flex flex-col items-center"><div className={`grid size-8 place-items-center rounded-full border ${s[3]==="policy"?"border-primary/40 bg-primary-soft text-primary":s[3]==="failure"?"border-danger/40 bg-danger-soft text-danger":s[3]==="pending"?"border-warning/40 bg-warning-soft text-warning":"border-ai/30 bg-ai-soft text-ai"}`}>{s[3]==="failure"?<X className="size-3.5"/>:s[3]==="policy"?<ShieldCheck className="size-3.5"/>:s[3]==="action"?<Zap className="size-3.5"/>:s[3]==="pending"?<Clock3 className="size-3.5"/>:<Check className="size-3.5"/>}</div>{i<steps.length-1&&<div className="my-1 min-h-10 w-px flex-1 bg-border"/>}</div><div className="pb-7"><div className="flex items-center justify-between gap-4"><p className="text-sm font-semibold text-foreground">{s[0]}</p><span className="font-mono text-[10px] text-muted-foreground">{s[1]}</span></div><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{s[2]}</p></div></div>)}</div></Panel><div className="space-y-4"><Panel><p className="eyebrow">AI Agent</p><p className="mt-3 text-sm font-semibold">Proposes the best action</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Uses failure context, customer history, and recovery patterns to rank actions.</p></Panel><Panel className="border-primary/30"><p className="eyebrow">Policy Engine</p><p className="mt-3 text-sm font-semibold">Decides what is allowed</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Deterministic rules supersede model confidence. This case requires a human.</p></Panel><Panel><p className="eyebrow">Action Layer</p><p className="mt-3 text-sm font-semibold">Executes permitted actions</p><p className="mt-2 text-xs leading-5 text-muted-foreground">No action runs without a policy decision and an immutable audit entry.</p></Panel><Panel><p className="text-xs text-muted-foreground">Recovery probability</p><p className="mt-2 text-3xl font-semibold text-success">86%</p><div className="mt-3 h-1.5 rounded-full bg-secondary"><div className="h-full w-[86%] rounded-full bg-success"/></div></Panel></div></div></div>; }
export function ApprovalsPage() { const [done,setDone]=useState<string[]>([]); const pending=cases.filter(c=>c.status==="Pending"||c.status==="Escalated"||c.status==="Blocked"); return <div className="space-y-6"><PageHeader eyebrow="Human-in-the-loop" title="Approval Queue" description="High-value or policy-sensitive recovery actions waiting for an accountable decision." action={<div className="text-right"><p className="text-2xl font-semibold text-warning">₹4.52L</p><p className="text-[11px] text-muted-foreground">value awaiting review</p></div>}/><Principle/><div className="space-y-4">{pending.map(c=><Panel key={c.id} className="overflow-hidden p-0"><div className="grid lg:grid-cols-[220px_1fr_220px]"><div className="border-b border-border p-6 lg:border-b-0 lg:border-r"><p className="font-mono text-[10px] text-muted-foreground">{c.id}</p><p className="mt-3 text-3xl font-semibold">{c.amount}</p><p className="mt-2 text-sm text-foreground">{c.customer}</p><p className="mt-1 text-xs text-muted-foreground">{c.history}</p></div><div className="grid gap-5 p-6 sm:grid-cols-2"><div><p className="eyebrow">Failure reason</p><p className="mt-2 text-sm text-foreground">{c.failure}</p><p className="mt-1 text-xs text-muted-foreground">{c.diagnosis}</p></div><div><p className="eyebrow">Expected recovery</p><p className="mt-2 text-sm text-success">{c.probability}% probability</p><p className="mt-1 text-xs text-muted-foreground">₹{Math.round(Number(c.amount.replace(/[^0-9]/g,""))*c.probability/100).toLocaleString("en-IN")} expected value</p></div><div><p className="eyebrow">AI recommendation</p><p className="mt-2 text-sm text-foreground">{c.action}</p></div><div><p className="eyebrow">Policy reason</p><p className="mt-2 text-sm text-foreground">Manual review threshold exceeded</p></div></div><div className="flex flex-row items-center gap-2 border-t border-border p-6 lg:flex-col lg:justify-center lg:border-l lg:border-t-0">{done.includes(c.id)?<div className="flex items-center gap-2 text-sm font-medium text-success"><CheckCircle2 className="size-5"/>Decision recorded</div>:<><Button className="flex-1 lg:w-full" onClick={async () => {
  await submitApproval(c.id, "APPROVE");
  setDone([...done, c.id]);
}}><Check className="size-4"/>Approve</Button><Button variant="danger" className="flex-1 lg:w-full" onClick={async () => {
  await submitApproval(c.id, "REJECT");
  setDone([...done, c.id]);
}}><X className="size-4"/>Reject</Button></>}</div></div></Panel>)}</div></div>; }

export function AnalyticsPage() { return <div className="space-y-6"><PageHeader eyebrow="Executive intelligence · Last 30 days" title="Recovery Analytics" description="Revenue outcomes, model uplift, root causes, and policy health across the recovery portfolio." action={<Button variant="secondary"><Download className="size-4"/>Download PDF</Button>}/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Revenue at risk" value="₹18.7L" change="2,847 payments"/><Metric label="Revenue recovered" value="₹42.6L" change="↑ 18.4%" tone="success"/><Metric label="Recovery rate" value="68.4%" change="↑ 5.2 pts"/><Metric label="Recovery uplift" value="+31.7%" change="vs baseline"/></div><div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"><Panel><SectionTitle title="Recovery trend" sub="Recovered value indexed against baseline"/><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><CartesianGrid stroke="var(--border)" vertical={false}/><XAxis dataKey="day" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={10}/><YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={10}/><Tooltip contentStyle={tipStyle}/><Line type="monotone" dataKey="doctor" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill:"var(--primary)", r:3 }}/><Line type="monotone" dataKey="naive" stroke="var(--muted-foreground)" strokeDasharray="5 5" dot={false}/></LineChart></ResponsiveContainer></div></Panel><Panel><SectionTitle title="Root-cause distribution" sub="Share of total failures"/><div className="mt-4 h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={rootCauses} innerRadius={58} outerRadius={82} paddingAngle={3} dataKey="value">{rootCauses.map((r)=><Cell key={r.name} fill={r.fill}/>)}</Pie><Tooltip contentStyle={tipStyle}/></PieChart></ResponsiveContainer></div><div className="space-y-2">{rootCauses.map(r=><div key={r.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-muted-foreground"><i className="size-2 rounded-full" style={{background:r.fill}}/>{r.name}</span><span className="font-mono text-foreground">{r.value}%</span></div>)}</div></Panel></div><div className="grid gap-4 md:grid-cols-3"><Panel><p className="text-xs text-muted-foreground">Uncollectable cases</p><p className="mt-3 text-2xl font-semibold">164</p><p className="mt-2 text-xs text-danger">5.8% of failed payments</p></Panel><Panel><p className="text-xs text-muted-foreground">Policy violations prevented</p><p className="mt-3 text-2xl font-semibold">37</p><p className="mt-2 text-xs text-success">₹8.2L exposure avoided</p></Panel><Panel><p className="text-xs text-muted-foreground">Median recovery time</p><p className="mt-3 text-2xl font-semibold">19.4h</p><p className="mt-2 text-xs text-success">↓ 4.1h from baseline</p></Panel></div></div>; }

const audit = [{time:"14:32:09",case:"RC-2048",event:"Failure",detail:"LIMIT_EXCEEDED returned by HDFC Bank",tone:"danger"},{time:"14:32:10",case:"RC-2048",event:"Diagnosis",detail:"Daily debit ceiling identified",tone:"ai"},{time:"14:32:11",case:"RC-2048",event:"AI Proposal",detail:"Retry tomorrow at 09:30 IST",tone:"ai"},{time:"14:32:12",case:"RC-2048",event:"Policy Decision",detail:"Human approval required above ₹75,000",tone:"policy"},{time:"14:32:13",case:"RC-2048",event:"Action",detail:"Execution paused pending approval",tone:"warning"},{time:"14:32:13",case:"RC-2048",event:"Outcome",detail:"Decision pending",tone:"warning"}];
export function AuditReplayPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs()
      .then((data) => {
        setLogs(data.records || []);

        if (data.records?.length) {
          setSelected(data.records[data.records.length - 1]);
        }
      })
      .catch((error) => {
        console.error("Audit error:", error);
      })
      .finally(() => setLoading(false));
  }, []);

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
          detail: `Recovery decision: ${selected.final_decision}`,
          tone: "pending",
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
          <Badge status={selected?.final_decision === "APPROVE" ? "Success" : "Pending"}>
            {selected ? selected.final_decision : "NO TRACE"}
          </Badge>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selected?.payment_id || ""}
            onChange={(e) => {
              const log = logs.find(
                (item) => item.payment_id === e.target.value
              );
              setSelected(log || null);
            }}
            className="h-10 flex-1 rounded-lg border border-border bg-secondary px-3 text-sm outline-none"
          >
            <option value="">Select audit record</option>

            {logs.map((log, index) => (
              <option key={`${log.payment_id}-${index}`} value={log.payment_id}>
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

      {loading ? (
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
                    playing && index < 4 ? "bg-accent" : ""
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

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {step.detail}
                    </p>
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
                    selected.final_decision === "APPROVE"
                      ? "Success"
                      : "Pending"
                  }
                >
                  {selected.final_decision}
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
export function SettingsPage(){const [kill,setKill]=useState(false); const [settings,setSettings]=useState({retry:3,cooling:12,threshold:75000,contacts:2}); const update=(key:keyof typeof settings,v:number)=>setSettings({...settings,[key]:v}); return <div className="space-y-6"><PageHeader eyebrow="Policy controls" title="Recovery Settings" description="Configure deterministic guardrails that govern every AI-proposed recovery action." action={<Button><Check className="size-4"/>Save changes</Button>}/><Principle/><div className="grid gap-6 xl:grid-cols-[1fr_340px]"><Panel><SectionTitle title="Recovery policy" sub="Version 2.4 · applies to all active mandates"/><div className="mt-6 divide-y divide-border">{[{key:"retry",label:"Retry limit",sub:"Maximum automated attempts per failed payment",suffix:"attempts"},{key:"cooling",label:"Cooling-off period",sub:"Minimum delay between recovery attempts",suffix:"hours"},{key:"threshold",label:"Human approval threshold",sub:"Payments above this value require approval",suffix:"₹"},{key:"contacts",label:"Maximum contact attempts",sub:"Customer messages allowed per recovery cycle",suffix:"messages"}].map(row=><div key={row.key} className="grid grid-cols-[minmax(0,1fr)_150px] items-center gap-5 py-5"><div><label htmlFor={row.key} className="text-sm font-medium text-foreground">{row.label}</label><p className="mt-1 text-xs text-muted-foreground">{row.sub}</p></div><div className="flex items-center rounded-lg border border-border bg-secondary"><input id={row.key} type="number" value={settings[row.key as keyof typeof settings]} onChange={e=>update(row.key as keyof typeof settings,Number(e.target.value))} className="h-10 min-w-0 flex-1 bg-transparent px-3 text-right font-mono text-sm outline-none"/><span className="pr-3 text-[10px] text-muted-foreground">{row.suffix}</span></div></div>)}</div></Panel><div className="space-y-4"><Panel className={kill?"border-danger/50":""}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">Recovery kill switch</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Immediately prevent all queued and new recovery actions.</p></div><button onClick={()=>setKill(!kill)} role="switch" aria-checked={kill} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${kill?"bg-danger":"bg-muted"}`}><span className={`absolute top-1 size-4 rounded-full bg-foreground transition-transform ${kill?"translate-x-6":"translate-x-1"}`}/></button></div>{kill&&<div className="mt-4 rounded-lg border border-danger/30 bg-danger-soft p-3 text-xs text-danger">Recovery execution is paused.</div>}</Panel><Panel><ShieldCheck className="size-5 text-primary"/><p className="mt-4 text-sm font-semibold">Policy-first execution</p><p className="mt-2 text-xs leading-5 text-muted-foreground">AI recommendations cannot bypass limits, approval thresholds, cooldowns, or contact policies.</p></Panel><Panel><p className="eyebrow">Environment</p><div className="mt-3 flex items-center justify-between"><span className="text-sm">Simulation mode</span><Badge status="Test">ACTIVE</Badge></div><p className="mt-3 text-xs leading-5 text-muted-foreground">All values and outcomes in this prototype are mock data.</p></Panel></div></div></div>}

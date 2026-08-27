import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { S as BrainCircuit, _ as CircleCheck, a as ShieldCheck, b as Check, c as Play, d as History, f as Funnel, h as Clock3, l as Pause, m as Download, n as X, r as TrendingUp, s as Search, t as Zap, v as ChevronRight } from "../_libs/lucide-react.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { a as XAxis, c as CartesianGrid, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as PieChart, o as Area, r as LineChart, s as Line, t as AreaChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pages-CGKkEzMc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var cases = [
	{
		id: "RC-2048",
		payment: "PAY-89320",
		customer: "Aarav Mehta",
		amount: "₹84,000",
		failure: "Limit Exceeded",
		diagnosis: "Daily debit ceiling reached",
		action: "Retry at 09:30 tomorrow",
		status: "Pending",
		probability: 86,
		history: "18 successful · 1 failed"
	},
	{
		id: "RC-2047",
		payment: "PAY-89319",
		customer: "Neha Kapoor",
		amount: "₹24,900",
		failure: "Balance",
		diagnosis: "Temporary balance shortfall",
		action: "Smart retry completed",
		status: "Recovered",
		probability: 94,
		history: "32 successful · 2 failed"
	},
	{
		id: "RC-2046",
		payment: "PAY-89318",
		customer: "Vikram Shah",
		amount: "₹1,28,000",
		failure: "Revoked Mandate",
		diagnosis: "Customer revoked authorization",
		action: "Request fresh mandate",
		status: "Escalated",
		probability: 61,
		history: "11 successful · 3 failed"
	},
	{
		id: "RC-2045",
		payment: "PAY-89317",
		customer: "Ishita Rao",
		amount: "₹12,500",
		failure: "Bank Timeout",
		diagnosis: "Issuer response timeout",
		action: "Retried after cooling-off",
		status: "Recovered",
		probability: 91,
		history: "9 successful · 1 failed"
	},
	{
		id: "RC-2044",
		payment: "PAY-89316",
		customer: "Karan Bedi",
		amount: "₹2,40,000",
		failure: "Expired Mandate",
		diagnosis: "Mandate expired 3 days ago",
		action: "Blocked by amount policy",
		status: "Blocked",
		probability: 72,
		history: "26 successful · 1 failed"
	},
	{
		id: "RC-2043",
		payment: "PAY-89315",
		customer: "Maya Iyer",
		amount: "₹8,400",
		failure: "Balance",
		diagnosis: "Persistent insufficient funds",
		action: "Recovery sequence exhausted",
		status: "Uncollectable",
		probability: 18,
		history: "4 successful · 7 failed"
	}
];
var trendData = [
	{
		day: "19 Aug",
		doctor: 42,
		naive: 18
	},
	{
		day: "20 Aug",
		doctor: 56,
		naive: 25
	},
	{
		day: "21 Aug",
		doctor: 51,
		naive: 27
	},
	{
		day: "22 Aug",
		doctor: 74,
		naive: 31
	},
	{
		day: "23 Aug",
		doctor: 68,
		naive: 34
	},
	{
		day: "24 Aug",
		doctor: 92,
		naive: 38
	},
	{
		day: "25 Aug",
		doctor: 108,
		naive: 43
	}
];
var rootCauses = [
	{
		name: "Balance",
		value: 38,
		fill: "var(--chart-1)"
	},
	{
		name: "Bank Timeout",
		value: 24,
		fill: "var(--chart-2)"
	},
	{
		name: "Limit Exceeded",
		value: 18,
		fill: "var(--chart-3)"
	},
	{
		name: "Expired Mandate",
		value: 12,
		fill: "var(--chart-4)"
	},
	{
		name: "Revoked",
		value: 8,
		fill: "var(--chart-5)"
	}
];
function Button({ className, variant = "primary", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: clsx("inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50", variant === "primary" && "bg-primary text-primary-foreground shadow-[0_0_24px_var(--primary-glow)] hover:-translate-y-0.5 hover:bg-primary/90", variant === "secondary" && "border border-border bg-secondary text-secondary-foreground hover:border-border-strong hover:bg-accent", variant === "danger" && "border border-danger/40 bg-danger-soft text-danger hover:bg-danger/20", variant === "ghost" && "text-muted-foreground hover:bg-accent hover:text-foreground", className),
		...props
	});
}
function Badge({ status, children }) {
	const kind = status ?? children;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide", kind === "Recovered" && "border-success/25 bg-success-soft text-success", kind === "Pending" && "border-warning/25 bg-warning-soft text-warning", kind === "Escalated" && "border-ai/25 bg-ai-soft text-ai", kind === "Blocked" && "border-danger/25 bg-danger-soft text-danger", kind === "Uncollectable" && "border-border bg-muted text-muted-foreground", kind === "AI" && "border-ai/25 bg-ai-soft text-ai", kind === "Policy" && "border-primary/25 bg-primary-soft text-primary", kind === "Test" && "border-warning/25 bg-warning-soft text-warning"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current" }), children ?? status]
	});
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: clsx("surface rounded-xl border border-border p-5", className),
		children
	});
}
function PageHeader({ eyebrow, title, description, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: eyebrow
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-6 text-muted-foreground",
					children: description
				})
			]
		}), action]
	});
}
function Metric({ label, value, change, tone = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:border-border-strong",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: clsx("text-2xl font-semibold tracking-tight", tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground"),
					children: value
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: clsx("text-xs font-medium", tone === "danger" ? "text-danger" : "text-success"),
					children: change
				})]
			})
		]
	});
}
var API_BASE_URL = "http://127.0.0.1:8000";
async function getOverviewMetrics() {
	const response = await fetch(`${API_BASE_URL}/api/overview`);
	if (!response.ok) throw new Error("Failed to fetch overview metrics");
	return response.json();
}
async function getRecoveryCases() {
	const response = await fetch(`${API_BASE_URL}/api/cases`);
	if (!response.ok) throw new Error("Failed to fetch recovery cases");
	return response.json();
}
async function submitApproval(paymentId, decision) {
	const response = await fetch(`${API_BASE_URL}/api/approvals`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			payment_id: paymentId,
			decision
		})
	});
	if (!response.ok) throw new Error("Failed to submit approval");
	return response.json();
}
async function getAuditLogs() {
	const response = await fetch(`${API_BASE_URL}/api/audit`);
	if (!response.ok) throw new Error("Failed to fetch audit logs");
	return response.json();
}
var tipStyle = {
	background: "var(--popover)",
	border: "1px solid var(--border)",
	borderRadius: 8,
	fontSize: 12
};
var funnel = [
	{
		label: "Failed",
		value: "2,847",
		width: "100%"
	},
	{
		label: "Diagnosed",
		value: "2,731",
		width: "85%"
	},
	{
		label: "Action taken",
		value: "1,924",
		width: "68%"
	},
	{
		label: "Recovered",
		value: "1,316",
		width: "49%"
	}
];
function Principle() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-lg border border-ai/20 bg-ai-soft px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrainCircuit, { className: "size-4 shrink-0 text-ai" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
				className: "text-foreground",
				children: "The AI proposes."
			}), " The Policy Engine decides."]
		})]
	});
}
function SectionTitle({ title, sub, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold text-foreground",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: sub
			})]
		}), action]
	});
}
function CasesTable({ rows = cases }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-5 overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[880px] text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border text-[10px] uppercase tracking-[0.1em] text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 font-medium",
						children: "Payment"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 font-medium",
						children: "Amount"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 font-medium",
						children: "Failure"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 font-medium",
						children: "Diagnosis"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 font-medium",
						children: "Action"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 font-medium",
						children: "Status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "group border-b border-border/60 text-sm last:border-0 hover:bg-accent/30",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-foreground",
							children: c.payment
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-muted-foreground",
							children: c.customer
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-4 font-medium text-foreground",
						children: c.amount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-4 text-muted-foreground",
						children: c.failure
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "max-w-52 py-4 text-muted-foreground",
						children: c.diagnosis
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "max-w-52 py-4 text-muted-foreground",
						children: c.action
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { status: c.status })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/recovery-cases/$caseId",
							params: { caseId: c.id },
							"aria-label": `View ${c.id}`,
							className: "grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
						})
					})
				]
			}, c.id)) })]
		})
	});
}
function formatRecoveryCase(c) {
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
		probability: Math.round(c.recovery_value.recovery_probability * 100)
	};
}
function OverviewPage() {
	const [metrics, setMetrics] = (0, import_react.useState)(null);
	const [recentCases, setRecentCases] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		getOverviewMetrics().then(setMetrics).catch((error) => console.error("Metrics error:", error));
		getRecoveryCases().then((data) => setRecentCases((data.cases || []).slice(0, 5).map(formatRecoveryCase))).catch((error) => console.error("Cases error:", error));
	}, []);
	const formatINR = (value) => {
		if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)}L`;
		return `₹${value.toLocaleString("en-IN")}`;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Live recovery posture · Demo data",
				title: "Good morning, Rohan.",
				description: "Your recovery engine is operating within policy.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export report"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden rounded-xl border border-border bg-card px-6 py-8 sm:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-noise absolute inset-0 opacity-60" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-24 -top-32 size-80 rounded-full bg-primary/10 blur-3xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 animate-pulse rounded-full bg-danger" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground",
									children: "Revenue at risk"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl",
								children: metrics ? formatINR(metrics.revenue_at_risk) : "Loading..."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-lg text-sm leading-6 text-muted-foreground",
								children: "Revenue currently recoverable across failed recurring payments."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-primary/20 bg-primary-soft p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-muted-foreground",
										children: "Recovery opportunity"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4 text-success" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex items-baseline gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xl font-semibold text-success",
										children: metrics ? formatINR(metrics.expected_recovery) : "Loading..."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "predicted recoverable"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 h-1.5 overflow-hidden rounded-full bg-background",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-success",
										style: { width: `${metrics?.expected_recovery_rate ?? 0}%` }
									})
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Revenue at risk",
						value: metrics ? formatINR(metrics.revenue_at_risk) : "—",
						change: `${metrics?.total_records ?? "—"} failed mandates`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Expected recovery",
						value: metrics ? formatINR(metrics.expected_recovery) : "—",
						change: metrics ? `${metrics.expected_recovery_rate}% expected rate` : "—",
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Expected unrecovered",
						value: metrics ? formatINR(metrics.expected_unrecovered) : "—",
						change: "Remaining exposure",
						tone: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Approved recoveries",
						value: metrics ? String(metrics.policy_decisions.APPROVE) : "—",
						change: metrics ? `${metrics.policy_decisions.BLOCK} blocked` : "—"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 xl:grid-cols-[0.85fr_1.4fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
						title: "Recovery funnel",
						sub: "Current synthetic dataset"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-7 space-y-3",
						children: funnel.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "w-5 font-mono text-[10px] text-muted-foreground",
								children: ["0", i + 1]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative h-12 overflow-hidden rounded-md border border-border bg-secondary",
								style: { width: item.width },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 left-0 w-full bg-gradient-to-r from-primary/20 to-ai/10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex h-full items-center justify-between px-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-medium text-foreground",
										children: item.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs text-foreground",
										children: item.value
									})]
								})]
							})]
						}, item.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-center justify-between border-t border-border pt-4 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Expected recovery rate"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-success",
							children: metrics ? `${metrics.expected_recovery_rate}%` : "—"
						})]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
						title: "Recovery performance",
						sub: "Mandate Doctor compared with baseline retry",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							status: "AI",
							children: "OPTIMIZED"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: trendData,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "doctor",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0%",
											stopColor: "var(--primary)",
											stopOpacity: .28
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "100%",
											stopColor: "var(--primary)",
											stopOpacity: 0
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "day",
										stroke: "var(--muted-foreground)",
										tickLine: false,
										axisLine: false,
										fontSize: 10
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										stroke: "var(--muted-foreground)",
										tickLine: false,
										axisLine: false,
										fontSize: 10
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: tipStyle }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "doctor",
										stroke: "var(--primary)",
										fill: "url(#doctor)",
										strokeWidth: 2
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: "naive",
										stroke: "var(--muted-foreground)",
										strokeDasharray: "5 5",
										dot: false
									})
								]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-5 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "size-2 rounded-full bg-primary" }), "Mandate Doctor"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "size-2 rounded-full bg-muted-foreground" }), "Naive retry"]
						})]
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				title: "Recent recovery cases",
				sub: "Latest decisions from the recovery engine",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/recovery-cases",
					className: "text-xs font-medium text-primary hover:text-primary/80",
					children: "View all cases →"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CasesTable, { rows: recentCases })] })
		]
	});
}
function RecoveryCasesPage() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [casesData, setCasesData] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		getRecoveryCases().then((data) => setCasesData(data.cases)).catch((error) => console.error("Cases error:", error)).finally(() => setLoading(false));
	}, []);
	const rows = casesData.filter((c) => `${c.payment_id} ${c.failure_code} ${c.diagnosis.root_cause}`.toLowerCase().includes(query.toLowerCase())).map(formatRecoveryCase);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Operations",
				title: "Recovery Cases",
				description: "Inspect every failed payment, diagnosis, policy decision, and outcome.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" }), "Run recovery batch"] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Principle, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						className: "h-10 w-full rounded-lg border border-border bg-secondary pl-10 pr-3 text-sm outline-none focus:border-primary/50",
						placeholder: "Search payment, customer, or failure..."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4" }), "Filters"]
				})]
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-12 text-center text-sm text-muted-foreground",
				children: "Loading recovery cases..."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CasesTable, { rows })] })
		]
	});
}
var steps = [
	[
		"Payment Failed",
		"02:41:08",
		"Bank returned LIMIT_EXCEEDED",
		"failure"
	],
	[
		"Root Cause Detected",
		"02:41:09",
		"Daily debit ceiling reached; not a permanent mandate failure",
		"ai"
	],
	[
		"Customer History Analyzed",
		"02:41:10",
		"18 successful renewals and only one prior soft decline",
		"ai"
	],
	[
		"Recovery Probability",
		"02:41:11",
		"86% likelihood if retried after daily limit resets",
		"ai"
	],
	[
		"AI Proposal",
		"02:41:12",
		"Retry once tomorrow at 09:30 IST; suppress customer contact",
		"ai"
	],
	[
		"Policy Decision",
		"02:41:12",
		"Human approval required: amount exceeds ₹75,000 threshold",
		"policy"
	],
	[
		"Action Executed",
		"Pending",
		"Queued until approval is recorded",
		"action"
	],
	[
		"Recovery Result",
		"Pending",
		"Awaiting permitted execution",
		"pending"
	]
];
function CaseReplayPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/recovery-cases",
						className: "hover:text-foreground",
						children: "Recovery Cases"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: "RC-2048"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Decision replay · RC-2048",
				title: "₹84,000 · Aarav Mehta",
				description: "A complete, deterministic replay of how this failed payment was diagnosed and governed.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { status: "Pending" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 xl:grid-cols-[1fr_320px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
						title: "Recovery decision trace",
						sub: "Every step is timestamped and reproducible",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Replay"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-7",
						children: steps.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-[32px_minmax(0,1fr)] gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `grid size-8 place-items-center rounded-full border ${s[3] === "policy" ? "border-primary/40 bg-primary-soft text-primary" : s[3] === "failure" ? "border-danger/40 bg-danger-soft text-danger" : s[3] === "pending" ? "border-warning/40 bg-warning-soft text-warning" : "border-ai/30 bg-ai-soft text-ai"}`,
									children: s[3] === "failure" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }) : s[3] === "policy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }) : s[3] === "action" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3.5" }) : s[3] === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" })
								}), i < steps.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-1 min-h-10 w-px flex-1 bg-border" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pb-7",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold text-foreground",
										children: s[0]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[10px] text-muted-foreground",
										children: s[1]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-xs leading-5 text-muted-foreground",
									children: s[2]
								})]
							})]
						}, s[0]))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "AI Agent"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm font-semibold",
								children: "Proposes the best action"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted-foreground",
								children: "Uses failure context, customer history, and recovery patterns to rank actions."
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							className: "border-primary/30",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									children: "Policy Engine"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm font-semibold",
									children: "Decides what is allowed"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs leading-5 text-muted-foreground",
									children: "Deterministic rules supersede model confidence. This case requires a human."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Action Layer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm font-semibold",
								children: "Executes permitted actions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted-foreground",
								children: "No action runs without a policy decision and an immutable audit entry."
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Recovery probability"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-3xl font-semibold text-success",
								children: "86%"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 h-1.5 rounded-full bg-secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-[86%] rounded-full bg-success" })
							})
						] })
					]
				})]
			})
		]
	});
}
function ApprovalsPage() {
	const [pendingCases, setPendingCases] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [busyId, setBusyId] = (0, import_react.useState)(null);
	const [completed, setCompleted] = (0, import_react.useState)([]);
	const [errors, setErrors] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		getRecoveryCases().then((data) => setPendingCases(data.cases || [])).catch((error) => console.error("Approvals loading error:", error)).finally(() => setLoading(false));
	}, []);
	const pending = (pendingCases || []).filter((c) => c.final_decision === "BLOCK" || c.final_decision === "REVIEW");
	const handleDecision = async (paymentId, decision) => {
		setBusyId(paymentId);
		setErrors((prev) => ({
			...prev,
			[paymentId]: ""
		}));
		try {
			await submitApproval(paymentId, decision);
			setCompleted((prev) => [...prev, paymentId]);
		} catch (error) {
			setErrors((prev) => ({
				...prev,
				[paymentId]: error?.message || "Request failed. Please try again."
			}));
		} finally {
			setBusyId(null);
		}
	};
	const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
	const expectedValue = (c) => "₹" + Math.round((c.recovery_value?.amount_at_risk || 0) * (c.recovery_value?.recovery_probability || 0)).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Human-in-the-loop",
				title: "Approval Queue",
				description: "High-value or policy-sensitive recovery actions waiting for an accountable decision.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-semibold text-warning",
						children: inr(pending.reduce((s, c) => s + (c.recovery_value?.amount_at_risk || 0), 0))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground",
						children: "value awaiting review"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Principle, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-12 text-center text-sm text-muted-foreground",
					children: "Loading approval queue..."
				}) }) : pending.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-12 text-center text-sm text-muted-foreground",
					children: "No approval decisions currently required."
				}) }) : pending.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					className: "overflow-hidden p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid lg:grid-cols-[220px_1fr_220px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-border p-6 lg:border-b-0 lg:border-r",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-[10px] text-muted-foreground",
										children: c.payment_id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-3xl font-semibold",
										children: inr(c.amount_inr)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-foreground",
										children: c.diagnosis?.root_cause?.replaceAll("_", " ")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											c.previous_successes,
											" successes · ",
											c.previous_failures,
											" failures"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-5 p-6 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "eyebrow",
											children: "Failure reason"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm text-foreground",
											children: c.diagnosis?.root_cause?.replaceAll("_", " ")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: c.diagnosis?.diagnosis
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "eyebrow",
											children: "Expected recovery"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-sm text-success",
											children: [Math.round((c.recovery_value?.recovery_probability || 0) * 100), "% probability"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: [expectedValue(c), " expected value"]
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "eyebrow",
										children: "AI recommendation"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-foreground",
										children: c.ai_proposal?.proposal
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "eyebrow",
										children: "Policy reason"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-foreground",
										children: c.policy?.reason
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-row items-center gap-2 border-t border-border p-6 lg:flex-col lg:justify-center lg:border-l lg:border-t-0",
								children: [completed.includes(c.payment_id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-medium text-success",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5" }), "Decision recorded"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "flex-1 lg:w-full",
									disabled: busyId === c.payment_id,
									onClick: () => handleDecision(c.payment_id, "APPROVE"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), busyId === c.payment_id ? "Submitting..." : "Approve"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "danger",
									className: "flex-1 lg:w-full",
									disabled: busyId === c.payment_id,
									onClick: () => handleDecision(c.payment_id, "REJECT"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), "Reject"]
								})] }), errors[c.payment_id] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-danger",
									children: errors[c.payment_id]
								})]
							})
						]
					})
				}, c.payment_id))
			})
		]
	});
}
function AnalyticsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Executive intelligence · Last 30 days",
				title: "Recovery Analytics",
				description: "Revenue outcomes, model uplift, root causes, and policy health across the recovery portfolio.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download PDF"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Revenue at risk",
						value: "₹18.7L",
						change: "2,847 payments"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Revenue recovered",
						value: "₹42.6L",
						change: "↑ 18.4%",
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Recovery rate",
						value: "68.4%",
						change: "↑ 5.2 pts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Recovery uplift",
						value: "+31.7%",
						change: "vs baseline"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 xl:grid-cols-[1.5fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
					title: "Recovery trend",
					sub: "Recovered value indexed against baseline"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 h-72",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: trendData,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--border)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "day",
									stroke: "var(--muted-foreground)",
									tickLine: false,
									axisLine: false,
									fontSize: 10
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "var(--muted-foreground)",
									tickLine: false,
									axisLine: false,
									fontSize: 10
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: tipStyle }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "doctor",
									stroke: "var(--primary)",
									strokeWidth: 2.5,
									dot: {
										fill: "var(--primary)",
										r: 3
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "naive",
									stroke: "var(--muted-foreground)",
									strokeDasharray: "5 5",
									dot: false
								})
							]
						})
					})
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
						title: "Root-cause distribution",
						sub: "Share of total failures"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 h-52",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: rootCauses,
								innerRadius: 58,
								outerRadius: 82,
								paddingAngle: 3,
								dataKey: "value",
								children: rootCauses.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: r.fill }, r.name))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: tipStyle })] })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: rootCauses.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
									className: "size-2 rounded-full",
									style: { background: r.fill }
								}), r.name]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-foreground",
								children: [r.value, "%"]
							})]
						}, r.name))
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Uncollectable cases"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-2xl font-semibold",
							children: "164"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-danger",
							children: "5.8% of failed payments"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Policy violations prevented"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-2xl font-semibold",
							children: "37"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-success",
							children: "₹8.2L exposure avoided"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Median recovery time"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-2xl font-semibold",
							children: "19.4h"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-success",
							children: "↓ 4.1h from baseline"
						})
					] })
				]
			})
		]
	});
}
function AuditReplayPage() {
	const [logs, setLogs] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getAuditLogs().then((data) => {
			setLogs(data.records || []);
			if (data.records?.length) setSelected(data.records[data.records.length - 1]);
		}).catch((error) => {
			setError("Failed to load audit records.");
			console.error("Audit error:", error);
		}).finally(() => setLoading(false));
	}, []);
	const actionLines = selected.action && (selected.action.action !== void 0 || selected.action.status !== void 0) ? [
		selected.action.action !== void 0 ? `Action: ${selected.action.action}` : null,
		selected.action.status !== void 0 ? `Status: ${selected.action.status}` : null,
		selected.action.simulated !== void 0 ? `Simulated: ${selected.action.simulated ? "yes" : "no"}` : null,
		selected.action.message ? `Message: ${selected.action.message}` : null,
		selected.action.retry_after_hours != null ? `Retry after: ${selected.action.retry_after_hours}h` : null
	].filter(Boolean) : ["No action layer result recorded."];
	const replaySteps = selected ? [
		{
			title: "Payment Failure",
			detail: `Payment ${selected.payment_id} failed and entered recovery.`,
			tone: "failure"
		},
		{
			title: "Diagnosis",
			detail: selected.diagnosis?.diagnosis || "Failure diagnosed.",
			tone: "ai"
		},
		{
			title: "AI Proposal",
			detail: selected.ai_proposal?.proposal || "Recovery action proposed.",
			tone: "ai"
		},
		{
			title: "Policy Decision",
			detail: selected.policy?.reason || "Policy engine evaluated the action.",
			tone: "policy"
		},
		{
			title: "Final Decision",
			detail: selected.final_decision ? `Recovery decision: ${selected.final_decision}` : selected.decision ? `Human decision: ${selected.decision}` : "Decision recorded.",
			tone: "pending"
		},
		{
			title: "Action Result",
			detail: "Action Layer outcome",
			tone: "result",
			lines: actionLines
		}
	] : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Immutable decision ledger",
				title: "Audit Replay",
				description: "Search and replay every inference, rule evaluation, action, and financial outcome.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					status: selected?.final_decision === "APPROVE" || selected?.decision === "APPROVE" ? "Success" : "Pending",
					children: selected ? selected.final_decision || selected.decision : "NO TRACE"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: selected ? String(logs.indexOf(selected)) : "",
					onChange: (e) => {
						setSelected(logs[Number(e.target.value)] || null);
					},
					className: "h-10 flex-1 rounded-lg border border-border bg-secondary px-3 text-sm outline-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Select audit record"
					}), logs.map((log, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: String(index),
						children: log.payment_id
					}, `${log.payment_id}-${index}`))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setPlaying(!playing),
					disabled: !selected,
					children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playing ? "Pause replay" : "Replay decision"]
				})]
			}) }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-12 text-center text-sm text-danger",
				children: error
			}) }) : loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-12 text-center text-sm text-muted-foreground",
				children: "Loading audit records..."
			}) }) : !selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-12 text-center text-sm text-muted-foreground",
				children: "No audit records available."
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 xl:grid-cols-[1fr_300px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
					title: "Decision timeline",
					sub: `Trace ${selected.payment_id}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-1",
					children: replaySteps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `grid grid-cols-[20px_minmax(0,1fr)] gap-3 rounded-lg p-3 transition-all ${playing ? "bg-accent" : ""}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex justify-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `mt-1.5 size-2 rounded-full ${step.tone === "failure" ? "bg-danger" : step.tone === "policy" ? "bg-primary" : step.tone === "ai" ? "bg-ai" : step.tone === "result" ? "bg-success" : "bg-warning"}` }), index < replaySteps.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-4 h-12 w-px bg-border" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: step.title
						}), step.lines ? step.lines.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-5 text-muted-foreground",
							children: line
						}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-5 text-muted-foreground",
							children: step.detail
						})] })]
					}, step.title))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm font-semibold",
								children: "Deterministic replay"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted-foreground",
								children: "Inputs, model proposal, policy decision, and final outcome are preserved together."
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Final decision"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									status: selected.final_decision === "APPROVE" || selected.decision === "APPROVE" ? "Success" : "Pending",
									children: selected.final_decision || selected.decision
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 break-all font-mono text-[9px] text-muted-foreground",
								children: selected.timestamp
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Audit integrity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center gap-2 text-sm text-success",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), "Trace verified"]
						})] })
					]
				})]
			})
		]
	});
}
function SettingsPage() {
	const [kill, setKill] = (0, import_react.useState)(false);
	const [settings, setSettings] = (0, import_react.useState)({
		retry: 3,
		cooling: 12,
		threshold: 75e3,
		contacts: 2
	});
	const update = (key, v) => setSettings({
		...settings,
		[key]: v
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Policy controls",
				title: "Recovery Settings",
				description: "Configure deterministic guardrails that govern every AI-proposed recovery action.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), "Save changes"] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Principle, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 xl:grid-cols-[1fr_340px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
					title: "Recovery policy",
					sub: "Version 2.4 · applies to all active mandates"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 divide-y divide-border",
					children: [
						{
							key: "retry",
							label: "Retry limit",
							sub: "Maximum automated attempts per failed payment",
							suffix: "attempts"
						},
						{
							key: "cooling",
							label: "Cooling-off period",
							sub: "Minimum delay between recovery attempts",
							suffix: "hours"
						},
						{
							key: "threshold",
							label: "Human approval threshold",
							sub: "Payments above this value require approval",
							suffix: "₹"
						},
						{
							key: "contacts",
							label: "Maximum contact attempts",
							sub: "Customer messages allowed per recovery cycle",
							suffix: "messages"
						}
					].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[minmax(0,1fr)_150px] items-center gap-5 py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: row.key,
							className: "text-sm font-medium text-foreground",
							children: row.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: row.sub
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center rounded-lg border border-border bg-secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: row.key,
								type: "number",
								value: settings[row.key],
								onChange: (e) => update(row.key, Number(e.target.value)),
								className: "h-10 min-w-0 flex-1 bg-transparent px-3 text-right font-mono text-sm outline-none"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pr-3 text-[10px] text-muted-foreground",
								children: row.suffix
							})]
						})]
					}, row.key))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							className: kill ? "border-danger/50" : "",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: "Recovery kill switch"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs leading-5 text-muted-foreground",
									children: "Immediately prevent all queued and new recovery actions."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setKill(!kill),
									role: "switch",
									"aria-checked": kill,
									className: `relative h-6 w-11 shrink-0 rounded-full transition-colors ${kill ? "bg-danger" : "bg-muted"}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-1 size-4 rounded-full bg-foreground transition-transform ${kill ? "translate-x-6" : "translate-x-1"}` })
								})]
							}), kill && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 rounded-lg border border-danger/30 bg-danger-soft p-3 text-xs text-danger",
								children: "Recovery execution is paused."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm font-semibold",
								children: "Policy-first execution"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted-foreground",
								children: "AI recommendations cannot bypass limits, approval thresholds, cooldowns, or contact policies."
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Environment"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: "Simulation mode"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									status: "Test",
									children: "ACTIVE"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs leading-5 text-muted-foreground",
								children: "All values and outcomes in this prototype are mock data."
							})
						] })
					]
				})]
			})
		]
	});
}
//#endregion
export { OverviewPage as a, CaseReplayPage as i, ApprovalsPage as n, RecoveryCasesPage as o, AuditReplayPage as r, SettingsPage as s, AnalyticsPage as t };

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import type { CaseStatus } from "../lib/mock-data";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  return <button className={clsx("inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50", variant === "primary" && "bg-primary text-primary-foreground shadow-[0_0_24px_var(--primary-glow)] hover:-translate-y-0.5 hover:bg-primary/90", variant === "secondary" && "border border-border bg-secondary text-secondary-foreground hover:border-border-strong hover:bg-accent", variant === "danger" && "border border-danger/40 bg-danger-soft text-danger hover:bg-danger/20", variant === "ghost" && "text-muted-foreground hover:bg-accent hover:text-foreground", className)} {...props} />;
}

export function Badge({ status, children }: { status?: CaseStatus | "AI" | "Policy" | "Test"; children?: ReactNode }) {
  const kind = status ?? children;
  return <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide", kind === "Recovered" && "border-success/25 bg-success-soft text-success", kind === "Pending" && "border-warning/25 bg-warning-soft text-warning", kind === "Escalated" && "border-ai/25 bg-ai-soft text-ai", kind === "Blocked" && "border-danger/25 bg-danger-soft text-danger", kind === "Uncollectable" && "border-border bg-muted text-muted-foreground", kind === "AI" && "border-ai/25 bg-ai-soft text-ai", kind === "Policy" && "border-primary/25 bg-primary-soft text-primary", kind === "Test" && "border-warning/25 bg-warning-soft text-warning")}><span className="size-1.5 rounded-full bg-current" />{children ?? status}</span>;
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={clsx("surface rounded-xl border border-border p-5", className)}>{children}</section>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6"><div className="min-w-0"><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</header>;
}

export function Metric({ label, value, change, tone = "default" }: { label: string; value: string; change: string; tone?: "default" | "success" | "danger" }) {
  return <Panel className="group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:border-border-strong"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"/><p className="text-xs font-medium text-muted-foreground">{label}</p><div className="mt-5 flex items-end justify-between gap-3"><p className={clsx("text-2xl font-semibold tracking-tight", tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground")}>{value}</p><p className={clsx("text-xs font-medium", tone === "danger" ? "text-danger" : "text-success")}>{change}</p></div></Panel>;
}

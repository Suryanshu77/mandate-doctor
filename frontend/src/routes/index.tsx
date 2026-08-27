import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "../components/pages";
export const Route = createFileRoute("/")({ head:()=>({meta:[{title:"Overview — Mandate Doctor"},{name:"description",content:"Monitor revenue at risk, recovery performance, and payment outcomes."},{property:"og:title",content:"Mandate Doctor Recovery Overview"},{property:"og:description",content:"AI-powered recurring payment recovery command center."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: OverviewPage });

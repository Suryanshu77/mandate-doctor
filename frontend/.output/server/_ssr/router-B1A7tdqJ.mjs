import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useRouter, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { C as Bell, a as ShieldCheck, g as CircleGauge, i as Sparkles, n as X, o as Settings, p as FileClock, s as Search, u as Menu, w as Activity, x as ChartColumn, y as ChevronDown } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-B1A7tdqJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var nav = [
	{
		label: "Overview",
		to: "/",
		icon: CircleGauge
	},
	{
		label: "Recovery Cases",
		to: "/recovery-cases",
		icon: Activity
	},
	{
		label: "Approvals",
		to: "/approvals",
		icon: ShieldCheck,
		count: 3
	},
	{
		label: "Analytics",
		to: "/analytics",
		icon: ChartColumn
	},
	{
		label: "Audit Replay",
		to: "/audit-replay",
		icon: FileClock
	},
	{
		label: "Settings",
		to: "/settings",
		icon: Settings
	}
];
function Sidebar({ close }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-sidebar px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-12 items-center gap-3 px-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-8 place-items-center rounded-lg border border-primary/30 bg-primary-soft shadow-[0_0_24px_var(--primary-glow)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4 text-primary" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-bold tracking-[0.16em] text-foreground",
						children: "MANDATE DOCTOR"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-[10px] text-muted-foreground",
						children: "Revenue recovery OS"
					})] }),
					close && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "ml-auto size-10 p-0",
						onClick: close,
						"aria-label": "Close navigation",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mt-8 space-y-1",
				children: nav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					activeOptions: { exact: item.to === "/" },
					onClick: close,
					activeProps: { className: "!bg-sidebar-accent !text-foreground before:opacity-100" },
					className: "relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors before:absolute before:left-0 before:h-5 before:w-0.5 before:rounded-full before:bg-primary before:opacity-0 hover:bg-sidebar-accent/60 hover:text-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label }),
						item.count && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto rounded-full bg-warning-soft px-2 py-0.5 text-[10px] text-warning",
							children: item.count
						})
					]
				}, item.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto rounded-xl border border-border bg-background/40 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-ai" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold text-foreground",
						children: "Decision discipline"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs leading-5 text-muted-foreground",
					children: [
						"The AI proposes.",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: "The Policy Engine decides."
						})
					]
				})]
			})
		]
	});
}
function AppShell({ children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const title = nav.find((item) => item.to === pathname)?.label ?? (pathname.startsWith("/recovery-cases/") ? "Case Replay" : "Mandate Doctor");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {})
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-50 lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "absolute inset-0 bg-overlay",
					onClick: () => setOpen(false),
					"aria-label": "Close navigation overlay"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "relative h-full w-72 border-r border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, { close: () => setOpen(false) })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:pl-64",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								className: "size-10 p-0 lg:hidden",
								onClick: () => setOpen(true),
								"aria-label": "Open navigation",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "hidden text-sm font-medium text-muted-foreground sm:block",
								children: title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative ml-auto hidden w-full max-w-xs md:block",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "h-9 w-full rounded-lg border border-border bg-secondary/60 pl-9 pr-14 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10",
										placeholder: "Search cases..."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
										className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground",
										children: "⌘ K"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								status: "Test",
								children: "TEST MODE"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								className: "relative size-10 p-0",
								"aria-label": "Notifications",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-2 top-2 size-1.5 rounded-full bg-danger" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent",
								"aria-label": "Open profile menu",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-7 place-items-center rounded-md bg-primary-soft text-xs font-semibold text-primary",
									children: "RK"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 text-muted-foreground" })]
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "mx-auto min-h-[calc(100vh-4rem)] max-w-[1600px] p-4 sm:p-6 lg:p-8",
					children
				})]
			})
		]
	});
}
var styles_default = "/assets/styles-CxYyysuA.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$8 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Mandate Doctor" },
			{
				name: "description",
				content: "AI-powered recurring payment recovery command center."
			},
			{
				name: "author",
				content: "Mandate Doctor"
			},
			{
				property: "og:title",
				content: "Mandate Doctor"
			},
			{
				property: "og:description",
				content: "AI-powered recurring payment recovery command center."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Manrope:wght@400;500;600;700&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$8.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
	});
}
var $$splitComponentImporter$7 = () => import("./routes-DbdIPgjM.mjs");
var Route$7 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Overview — Mandate Doctor" },
		{
			name: "description",
			content: "Monitor revenue at risk, recovery performance, and payment outcomes."
		},
		{
			property: "og:title",
			content: "Mandate Doctor Recovery Overview"
		},
		{
			property: "og:description",
			content: "AI-powered recurring payment recovery command center."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./analytics-X2pe6e8c.mjs");
var Route$6 = createFileRoute("/analytics")({
	head: () => ({ meta: [
		{ title: "Analytics — Mandate Doctor" },
		{
			name: "description",
			content: "Executive recovery analytics and policy health."
		},
		{
			property: "og:title",
			content: "Recovery Analytics — Mandate Doctor"
		},
		{
			property: "og:description",
			content: "Revenue recovery performance and root-cause intelligence."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./approvals-f4ZuLGz-.mjs");
var Route$5 = createFileRoute("/approvals")({
	head: () => ({ meta: [
		{ title: "Approvals — Mandate Doctor" },
		{
			name: "description",
			content: "Review high-value payment recovery actions."
		},
		{
			property: "og:title",
			content: "Recovery Approvals — Mandate Doctor"
		},
		{
			property: "og:description",
			content: "Make accountable high-value recovery decisions."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./audit-replay-D6CLij9L.mjs");
var Route$4 = createFileRoute("/audit-replay")({
	head: () => ({ meta: [
		{ title: "Audit Replay — Mandate Doctor" },
		{
			name: "description",
			content: "Search and replay deterministic recovery decisions."
		},
		{
			property: "og:title",
			content: "Audit Replay — Mandate Doctor"
		},
		{
			property: "og:description",
			content: "Trace every diagnosis, proposal, policy decision, and outcome."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./recovery-cases-BIBhwcWA.mjs");
var Route$3 = createFileRoute("/recovery-cases")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./settings-D6UJjTQ-.mjs");
var Route$2 = createFileRoute("/settings")({
	head: () => ({ meta: [
		{ title: "Settings — Mandate Doctor" },
		{
			name: "description",
			content: "Configure deterministic recovery policies and limits."
		},
		{
			property: "og:title",
			content: "Recovery Settings — Mandate Doctor"
		},
		{
			property: "og:description",
			content: "Configure safe AI recovery guardrails."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./recovery-cases.index-CN-oAdSs.mjs");
var Route$1 = createFileRoute("/recovery-cases/")({
	head: () => ({ meta: [
		{ title: "Recovery Cases — Mandate Doctor" },
		{
			name: "description",
			content: "Inspect failed recurring payment recovery cases."
		},
		{
			property: "og:title",
			content: "Recovery Cases — Mandate Doctor"
		},
		{
			property: "og:description",
			content: "Inspect diagnoses, actions, and recovery outcomes."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./recovery-cases._caseId-UbiDxdxG.mjs");
var Route = createFileRoute("/recovery-cases/$caseId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$8
});
var AnalyticsRoute = Route$6.update({
	id: "/analytics",
	path: "/analytics",
	getParentRoute: () => Route$8
});
var ApprovalsRoute = Route$5.update({
	id: "/approvals",
	path: "/approvals",
	getParentRoute: () => Route$8
});
var AuditReplayRoute = Route$4.update({
	id: "/audit-replay",
	path: "/audit-replay",
	getParentRoute: () => Route$8
});
var RecoveryCasesRoute = Route$3.update({
	id: "/recovery-cases",
	path: "/recovery-cases",
	getParentRoute: () => Route$8
});
var SettingsRoute = Route$2.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$8
});
var RecoveryCasesIndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => RecoveryCasesRoute
});
var RecoveryCasesRouteChildren = {
	RecoveryCasesCaseIdRoute: Route.update({
		id: "/$caseId",
		path: "/$caseId",
		getParentRoute: () => RecoveryCasesRoute
	}),
	RecoveryCasesIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AnalyticsRoute,
	ApprovalsRoute,
	AuditReplayRoute,
	RecoveryCasesRoute: RecoveryCasesRoute._addFileChildren(RecoveryCasesRouteChildren),
	SettingsRoute
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };

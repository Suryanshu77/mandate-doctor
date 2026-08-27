import { Plugin } from "vite";
//#region src/hmr-gate/index.d.ts
declare const DEV_SERVER_MODE_EVENT = "lovable:dev-server-mode";
declare const BOOT_PROGRESS_EVENT = "lovable:boot-progress";
declare const UPDATE_PROGRESS_EVENT = "lovable:update-progress";
type UpdateTrigger = "flush" | "watch" | "restart";
interface UpdateProgressData {
  batch: number;
  trigger: UpdateTrigger;
  ssrModules: number;
  clientModules: number;
  idleMs: number | null;
  done: boolean;
  buildError: BootProgressData["buildError"];
}
interface BootProgressData {
  ssrModules: number;
  clientModules: number;
  /** ms since the newest transform, measured on the server's own clock so the
        browser never differences two machines' timestamps. */
  ssrIdleMs: number | null;
  clientIdleMs: number | null;
  buildError: {
    message: string;
    file: string | null;
    line: number | null;
  } | null;
}
/** Host-controlled default for `fullReload`; an explicit option still wins. */
declare const FULL_RELOAD_ENV_VAR = "LOVABLE_HMR_FULL_RELOAD";
interface HmrGateOptions {
  /** Use full-reload (default) vs granular per-module HMR. Unset reads
   * `LOVABLE_HMR_FULL_RELOAD`, where only "false" selects granular. */
  fullReload?: boolean;
  /** Bundled dev only: ms the gate stays open after a flush so the client's
   * queued patch fetches drain. Default 1500. */
  drainMs?: number;
  /** Max ms held work survives without a flush before the gate fail-opens
   * (classic self-flushes; bundled dev releases parked patches). Default 240000. */
  maxHoldMs?: number;
  /** Bundled dev only: ms after server start during which full-reload frames
   * (Vite's restart resync) pass through live. Default 5000. */
  startupGraceMs?: number;
  /** Watcher events to intercept. Default: all three — a freeze must catch adds and
   * deletes, not just content changes (e.g. atomic writes / synced files surface as add/unlink). */
  events?: ("change" | "add" | "unlink")[];
  /** File path substrings that bypass the gate (always emitted immediately). */
  passthrough?: string[];
}
declare function hmrGatePlugin(options?: HmrGateOptions): Plugin;
//#endregion
export { BOOT_PROGRESS_EVENT, BootProgressData, DEV_SERVER_MODE_EVENT, FULL_RELOAD_ENV_VAR, HmrGateOptions, UPDATE_PROGRESS_EVENT, UpdateProgressData, UpdateTrigger, hmrGatePlugin };
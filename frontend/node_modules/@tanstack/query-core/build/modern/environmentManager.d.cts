//#region src/environmentManager.d.ts
type IsServerValue = () => boolean;
/**
 * Manages environment detection used by TanStack Query internals.
 */
declare const environmentManager: {
  /**
   * Returns whether the current runtime should be treated as a server environment.
   */
  isServer(): boolean;
  /**
   * Overrides the server check globally.
   */
  setIsServer(isServerValue: IsServerValue): void;
};
//#endregion
export { IsServerValue, environmentManager };
//# sourceMappingURL=environmentManager.d.cts.map
// Backend event extensions are bundled separately from the Astro app. The middleware
// publishes server secrets here so event handlers can use the same worker global.
const KEY = Symbol.for('lifecycle-sheets-env');

export type LifecycleSheetsEnv = {
  LIFECYCLE_SHEETS_WEBHOOK_URL?: string | undefined;
  LIFECYCLE_SHEETS_WEBHOOK_SECRET?: string | undefined;
};

type Holder = typeof globalThis & { [KEY]?: LifecycleSheetsEnv };

export function publishLifecycleSheetsEnv(env: LifecycleSheetsEnv): void {
  (globalThis as Holder)[KEY] = env;
}

export function readLifecycleSheetsEnv(): LifecycleSheetsEnv {
  return (globalThis as Holder)[KEY] ?? {};
}

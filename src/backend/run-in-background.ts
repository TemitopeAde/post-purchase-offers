const LOG_PREFIX = '[Post-Purchase Offers]';
const workers = import('cloudflare:workers').catch(() => null);

/** Acknowledge Wix webhooks quickly while keeping background work alive. */
export function runInBackground(label: string, task: () => Promise<unknown>): void {
  const settled = Promise.resolve()
    .then(task)
    .catch((error) => console.error(`${LOG_PREFIX} ${label} failed`,
      error instanceof Error ? error.message : 'Unknown error'));
  void workers.then((module) => module?.waitUntil(settled));
}

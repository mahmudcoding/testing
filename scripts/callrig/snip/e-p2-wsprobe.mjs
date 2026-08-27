export default async ({page}) => {
  // read-only: what WS endpoints exist, and is there a wrapper on this page?
  const info = await page.evaluate(() => ({
    wrapped: typeof window.WebSocket === 'function' && /native code/.test(Function.prototype.toString.call(window.WebSocket)) === false,
    hasHook: typeof window.__pcs !== 'undefined',
    url: location.pathname,
    perf: performance.getEntriesByType('resource').filter(r=>/^wss?:/.test(r.name)).map(r=>r.name).slice(0,5),
  }));
  return info;
};

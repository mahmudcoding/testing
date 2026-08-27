// Read-only probe: never navigates, never reloads. Safe to run against the
// long-idle subject page repeatedly.
export default async ({page}) => {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const openedMs = performance.now();
    const msgs = [...document.querySelectorAll('main [data-message-id]')];
    const last = msgs[msgs.length-1];
    const ws = (window.__wsState || null);
    return {
      openMin: +(openedMs/60000).toFixed(1),
      url: location.pathname.slice(-16),
      visibility: document.visibilityState,
      msgCount: msgs.length,
      lastText: last ? (last.innerText||'').replace(/\s+/g,' ').slice(-40) : null,
      heapMB: performance.memory ? +(performance.memory.usedJSHeapSize/1048576).toFixed(1) : null,
      heapLimitMB: performance.memory ? +(performance.memory.jsHeapSizeLimit/1048576).toFixed(0) : null,
      domNodes: document.getElementsByTagName('*').length,
      navType: nav ? nav.type : null,
    };
  });
};

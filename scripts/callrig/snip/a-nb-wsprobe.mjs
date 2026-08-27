export default async ({page}) => await page.evaluate(()=>({
  hooked: !!window.__wsHooked, len: (window.__wsLog||[]).length,
  patched: /Patched/.test(String(window.WebSocket)) || String(window.WebSocket).slice(0,60),
  path: location.pathname }));

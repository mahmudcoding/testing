export default async ({page}) => page.evaluate(()=>({
  entries: (window.__pinlog||[]).map(e=>`${e.t}s: ${e.v}`).slice(0,10),
  running: !!window.__pinint, url: location.pathname
}));

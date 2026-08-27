export default async ({page}) => { await page.waitForTimeout(10000);
  return page.evaluate(()=>({log:(window.__ulog||[]).map(e=>`${e.t}s: ${e.v}`),
    stillViewing:location.pathname})); };

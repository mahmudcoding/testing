export default async ({ page }) => {
  const all=[];
  const onMsg=m=>all.push(m.type()+': '+m.text().replace(/\s+/g,' ').slice(0,110));
  page.on('console', onMsg);
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const probe = await page.evaluate(`(() => {
    console.log('D2-INSTRUMENT-CHECK');            // does my listener see anything at all?
    const r = { devtoolsHook: typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' };
    // React in production mode: its renderers report a bundleType of 0
    try {
      const h=window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (h && h.renderers) r.bundleTypes=[...h.renderers.values()].map(x=>x.bundleType);
    } catch(e){ r.err=String(e).slice(0,60); }
    return r; })()`);
  await page.waitForTimeout(600);
  page.off('console', onMsg);
  return { totalConsoleMessages: all.length,
           sawMyOwnLog: all.some(x=>/D2-INSTRUMENT-CHECK/.test(x)),
           sample: all.slice(0,6), react: probe };
};

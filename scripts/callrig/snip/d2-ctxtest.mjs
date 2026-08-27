export default async ({ browser }) => {
  try {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto('https://airion-cargo.store/login', { waitUntil:'domcontentloaded' });
    await p.waitForTimeout(1500);
    const url = p.url();
    const has = await p.evaluate(() => ({
      title:document.title.slice(0,40),
      inputs:[...document.querySelectorAll('input')].map(i=>i.name||i.type).slice(0,6)
    }));
    await ctx.close();
    return { ok:true, url, has };
  } catch (e) { return { ok:false, err:String(e).slice(0,160) }; }
};

export default async ({page}) => {
  if (!page.url().includes('airion-cargo.store')) {
    await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(2500);
  }
  return await page.evaluate(async () => {
    const j = async (u) => { try { const r = await fetch(u,{credentials:'include'}); return {s:r.status, b: await r.json()}; } catch(e){ return {err:String(e)}; } };
    const me = await j('/api/v1/auth/me');
    const out = {url: location.href, vis: document.visibilityState, status: me.s, email: me.b && me.b.email, id: me.b && me.b.id};
    return out;
  });
};

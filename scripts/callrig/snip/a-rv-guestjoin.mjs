import { DOM } from './lib.mjs';
export default async ({ page, ctx }) => {
  const out = {};
  const LINK = process.env.QA_LINK;
  await ctx.clearCookies();
  await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch(e){} });
  out.anonStatus = await page.evaluate(async () => (await fetch('/api/v1/auth/me',{credentials:'include'})).status);
  await page.goto(LINK, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.landing = await page.evaluate(() => ({
    url: location.pathname.slice(0,60),
    txt: (document.body.innerText||'').replace(/\s+/g,' ').slice(0,320),
    inputs: [...document.querySelectorAll('input')].filter(window.__qa.boxVis).map(i=>({ph:(i.placeholder||'').slice(0,32), type:i.type})),
    btns: [...document.querySelectorAll('button')].filter(window.__qa.vis).map(b=>window.__qa.nameOf(b).replace(/\s+/g,' ').trim().slice(0,30)).filter(Boolean),
  }));
  const nm = process.env.QA_NAME || 'Guest';
  const inp = page.locator('input:visible').first();
  if (await inp.count()) { await inp.fill(nm); await page.waitForTimeout(800); }
  await page.evaluate(DOM);
  for (const re of ['^Continue$','^Join$','^Join now$','^Join call$','^Ask to join$']) {
    const r = await page.evaluate((s)=>window.__qa.clickDeepest(new RegExp(s)), re);
    if (r.ok) { out.clicked = (out.clicked||[]).concat(r.name); await page.waitForTimeout(5000); await page.evaluate(DOM); }
  }
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  out.after = await page.evaluate(() => ({
    url: location.pathname.slice(0,60),
    txt: (document.body.innerText||'').replace(/\s+/g,' ').slice(0,300),
    btns: [...document.querySelectorAll('button')].filter(window.__qa.vis).map(b=>window.__qa.nameOf(b).replace(/\s+/g,' ').trim().slice(0,30)).filter(Boolean),
  }));
  return out;
};

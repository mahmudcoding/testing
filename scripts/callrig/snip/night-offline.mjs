import { RTC_STATS } from './lib.mjs';
export default async ({page, ctx}) => {
  const offMs = Number(process.env.QA_OFF||20000);
  const snap = async (tag) => {
    const ui = await page.evaluate(()=>({
      inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
      banners: [...document.querySelectorAll('[data-testid*="banner" i],[role="alert"],[role="status"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,160)).filter(Boolean),
      net: (n=>n?n.innerText.replace(/\n+/g,'/'):null)(document.querySelector('[data-testid="call-network-indicator"]')),
      online: navigator.onLine,
      mainText: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,120)
    }));
    const r = await page.evaluate('('+RTC_STATS+')()');
    return {tag, ui, conns: r.stats.map(s=>s.conn)};
  };
  const out=[];
  out.push(await snap('before'));
  await ctx.setOffline(true);
  for (const w of [3000, 7000, offMs-10000>0?offMs-10000:5000]) { await page.waitForTimeout(w); out.push(await snap('offline+'+w+'ms')); }
  await ctx.setOffline(false);
  for (const w of [3000, 8000, 12000]) { await page.waitForTimeout(w); out.push(await snap('online+'+w+'ms')); }
  return out;
};

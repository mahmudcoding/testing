import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const r = await page.evaluate('('+RTC_STATS+')()');
  const ui = await page.evaluate(()=>({
    url: location.href,
    inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
    banners: [...document.querySelectorAll('[data-testid*="banner" i],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,140)).filter(Boolean),
    net: (n=>n?n.innerText.replace(/\n+/g,'/'):null)(document.querySelector('[data-testid="call-network-indicator"]')),
    visibility: document.visibilityState
  }));
  return {pcs:r.pcs, conns:r.stats.map(s=>({conn:s.conn, ice:s.ice, out:s.out.length, in:s.in.length})), ui};
};

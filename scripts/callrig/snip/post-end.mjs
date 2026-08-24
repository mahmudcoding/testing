import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const rtc = await page.evaluate('('+RTC_STATS+')()');
  const ui = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].pop();
    return {url: location.href,
      overlay: !!document.querySelector('[data-testid="call-ended-overlay"]'),
      dialogText: d? d.innerText.replace(/\n+/g,' | ').slice(0,350):null,
      tabs: (document.querySelector('[data-testid="call-header-tabs"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,120),
      toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean),
      body: document.body.innerText.replace(/\n+/g,' | ').slice(0,320)};
  });
  const api = await page.evaluate(async () => {
    const j = async p => { const r=await fetch(p,{credentials:'include'}); return r.status+' '+(await r.text()).slice(0,180); };
    return {current: await j('/api/v1/meetings/current'), meeting: await j('/api/v1/meeting/V4OTLVMJL42ZGIG')};
  });
  return {ui, api, pcs: rtc.pcs, conns: rtc.stats.map(p=>p.conn)};
};

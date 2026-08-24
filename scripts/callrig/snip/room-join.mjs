import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('breakout')){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const t = page.locator('[data-testid="call-controls-breakout-rooms"]');
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true') { await t.click(); await page.waitForTimeout(2500); }
  const panel = await page.evaluate(() => {
    const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {text: s.innerText.replace(/\n+/g,' | ').slice(0,400), buttons: [...s.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32)}#${b.getAttribute('data-testid')||'-'}`).slice(-16)};
  });
  const jb = page.locator('button', {hasText:/^Join$|^Join room$/}).first();
  let joined=false;
  if (await jb.count()) { await jb.click(); joined=true; await page.waitForTimeout(7000); }
  const after = await page.evaluate(() => {
    const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {text: s.innerText.replace(/\n+/g,' | ').slice(0,400),
            tabs: (document.querySelector('[data-testid="call-header-tabs"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,150),
            shareLabel: (document.querySelector('[data-testid="call-controls-screen-share"]')||{}).getAttribute?.('aria-label'),
            videos: [...document.querySelectorAll('video')].map(v=>(v.closest('[aria-label]')||{}).getAttribute?.('aria-label')).slice(0,8)};
  });
  const rtc = await page.evaluate('('+RTC_STATS+')()');
  return {panel, joined, after, pcs: rtc.pcs, streams: rtc.stats.map(pc=>({conn:pc.conn, out:pc.out.map(o=>o.kind+' '+(o.w||'')+'x'+(o.h||'')), inN:pc.in.length}))};
};

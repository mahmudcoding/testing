import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/c/C4QEPRIVATE0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.evaluate(`(() => { const m=[...document.querySelectorAll('[data-message-id]')].pop(); m && m.scrollIntoView({block:'center'}); })()`);
  const probe = `(() => {
    const m=[...document.querySelectorAll('[data-message-id]')].pop(); if(!m) return 'nomsg';
    const img=m.querySelector('img');
    if(!img) return 'noimg h='+Math.round(m.getBoundingClientRect().height);
    let n=img,op=1,zero=null; while(n&&n!==document.documentElement){ const o=parseFloat(getComputedStyle(n).opacity||'1');
      if(o<0.99 && !zero) zero=n.tagName+'.'+String(n.className||'').slice(0,30); op*=o; n=n.parentElement; }
    return 'op='+op.toFixed(2)+' msgH='+Math.round(m.getBoundingClientRect().height)+(zero?' by '+zero:''); })()`;
  const t=[]; for(let i=0;i<16;i++){ await page.waitForTimeout(1000); t.push(await page.evaluate(probe)); }
  out.trace=[...new Set(t)].join('  ->  ');
  out.last = t[t.length-1];
  return out;
};

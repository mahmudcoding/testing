import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  out.apiToday = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-25T19:00:00.000Z&to=2026-08-26T19:00:00.000Z',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.meetings||[];
    return {n:a.length, titles:a.map(m=>m.title.slice(0,22)+' '+m.starts_at.slice(11,16))}; })()`);
  for (const v of ['Month','Day']) {
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
      const m=document.querySelector('main'); return clickDeepest(m, new RegExp('^'+${JSON.stringify(v)}+'$')); })()`);
    await page.waitForTimeout(5000);
    out[v] = await page.evaluate(`(() => { ${VISFN}
      const m=document.querySelector('main');
      const chips=[...document.querySelectorAll('[data-testid*="chip"]')];
      const header=(m.innerText||'').split('\\n').slice(0,3).join(' | ').slice(0,80);
      const overflow=[...m.querySelectorAll('button')].filter(b=>vis(b)&&/\\+\\d+ more/.test(b.textContent||''))
        .map(b=>(b.textContent||'').trim());
      return {header, chipTestids:[...new Set(chips.map(c=>c.getAttribute('data-testid')))],
        chipCount:chips.length, visibleChips:chips.filter(vis).length,
        overflowControls:overflow,
        todayCellText: (()=>{const c=[...m.querySelectorAll('*')].find(n=>/^26\\b/.test((n.innerText||'').trim())&&(n.innerText||'').length<300&&(n.innerText||'').includes(':'));
          return c? (c.innerText||'').replace(/\\n+/g,' | ').slice(0,220):null;})()}; })()`);
  }
  return out;
};

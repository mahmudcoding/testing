import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  // enumerate the create-event cells across columns
  out.cells = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const c=[...m.querySelectorAll('button')].filter(vis)
      .filter(b=>/Create event/i.test(b.getAttribute('aria-label')||b.textContent||''));
    const names=c.map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim());
    const uniq=[...new Set(names)];
    return { total:c.length, distinct:uniq.length, sample:uniq.slice(0,10),
             anyWithTime: names.filter(n=>/\\d{1,2}[:.]\\d{2}|\\d{1,2}\\s*(AM|PM)/i.test(n)).length }; })()`);
  // click a specific cell — index 6 (7th visible slot) — and record which one we clicked
  out.clicked = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const c=[...m.querySelectorAll('button')].filter(vis)
      .filter(b=>/Create event/i.test(b.getAttribute('aria-label')||b.textContent||''));
    const el=c[6]; if(!el) return 'no cell 6';
    const r=el.getBoundingClientRect();
    window.__cellInfo={label:(el.getAttribute('aria-label')||'').trim(), x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)};
    el.click(); return window.__cellInfo; })()`);
  await page.waitForTimeout(4500);
  out.form = await page.evaluate(`(() => { ${VISFN}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>1&&r.height>1;}).pop();
    if(!d) return 'no dialog';
    const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
      const i=d.querySelector('input[data-field="'+k+'"]'); f[k]= i? String(i.value||'') : '(absent)'; });
    const t=(d.innerText||'').replace(/\\s+/g,' ');
    return {fields:f, summary:t.slice(0,180)}; })()`);
  // where were the column headers?
  out.columns = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    return [...m.querySelectorAll('*')].filter(vis).map(n=>(n.textContent||'').trim())
      .filter(t=>/^(MON|TUE|WED|THU|FRI|SAT|SUN)\\s*\\d{1,2}$/.test(t)).slice(0,7); })()`);
  return out;
};

import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const NAME = process.env.QA_CHIP || 'QA-E RSVP probe';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:NAME}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700);
  out.chipText = (await chip.innerText()).replace(/\s+/g,' ').slice(0,50);
  await chip.click(); await page.waitForTimeout(4000);
  out.cardText = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return (d.innerText||'').replace(/\\n+/g,' | ').slice(0,120); })()`);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); return clickDeepest(d,/^\\s*Edit\\s*$/); })()`);
  await page.waitForTimeout(3500);
  out.editButtons = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis); const d=ds[ds.length-1];
    return [...d.querySelectorAll('button')].filter(vis)
      .map(b=>((b.getAttribute('aria-label')||'')+'|'+(b.textContent||'')).replace(/\\s+/g,' ').trim())
      .filter(t=>/date and time|Aug|:/i.test(t)).slice(0,6); })()`);
  return out;
};

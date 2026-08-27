import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const surf = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  const root=d||document.querySelector('main');
  return {where:d?'dialog':'page',
    text:(root.innerText||'').replace(/\\n+/g,' | ').slice(0,320),
    inputs:[...root.querySelectorAll('input')].filter(vis).map(i=>'ph="'+(i.getAttribute('placeholder')||'')+'" al="'+(i.getAttribute('aria-label')||'')+'"'),
    ctrls: interactives(root).map(x=>x.label.slice(0,22)).join(' | ').slice(0,240)}; })()`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url(); if(/search|meetings\?/.test(u)&&u.includes('/api/v1/')) reqs.push(decodeURIComponent(u).replace(/^https:\/\/[^/]+/,'').slice(0,120)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main'); return clickDeepest(m, /^Search$/); })()`);
  await page.waitForTimeout(3000);
  out.surface = await page.evaluate(surf);
  const inp = page.locator('main input, [role=dialog] input').first();
  const n = await page.locator('main input, [role=dialog] input').count();
  out.inputCount = n;
  if (n) {
    for (const q of ['Monthly','Rem five','standup','zzzznope']) {
      reqs.length=0;
      await inp.fill(''); await page.waitForTimeout(600);
      await inp.fill(q); await page.waitForTimeout(3500);
      out['q['+q+']'] = {res: (await page.evaluate(surf)).text.slice(0,200), req: reqs.slice(-1)[0]||'(none)'};
    }
  }
  return out;
};

import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const dlg = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return {none:true};
  return {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,520),
    ctrls: interactives(d).map(x=>x.label.slice(0,22)+(x.disabled?'[D]':'')).join(' | ').slice(0,420)}; })()`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/search')){
    let b=''; try{b=(await r.text()).slice(0,240);}catch(e){}
    reqs.push(u.replace(/^https:\/\/[^/]+/,'').slice(0,150)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.locator('button[aria-label^="Search "]').first().click();
  await page.waitForTimeout(2200);
  out.emptyDialog = await page.evaluate(dlg);
  const input = page.locator('[role=dialog] input, input[type=search]').first();
  reqs.length=0;
  await input.fill('probe');
  await page.waitForTimeout(3500);
  out.afterQuery = await page.evaluate(dlg);
  out.searchReqs = reqs.slice(-3);
  return out;
};

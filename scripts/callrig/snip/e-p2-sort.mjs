import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url(); if(u.includes('/api/v1/search')) reqs.push(u.replace(/^https:\/\/[^/]+/,'').slice(0,150)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.locator('button[aria-label^="Search "]').first().click();
  await page.waitForTimeout(2200);
  await page.locator('[role=dialog] input, input[type=search]').first().fill('probe');
  await page.waitForTimeout(3500);
  const results = `(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const t=(d.innerText||'').replace(/\\n+/g,' | ');
    const rows=[...d.querySelectorAll('li button')].filter(vis).map(b=>(b.innerText||'').replace(/\\s+/g,' ').slice(0,46));
    return {sortLabel:(t.match(/Relevance|Newest|Oldest|Recent/)||['?'])[0], rows}; })()`;
  out.beforeSort = await page.evaluate(results);
  out.openSort = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Relevance$/); })()`);
  await page.waitForTimeout(2000);
  out.sortOptions = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=menu],[role=listbox],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1];
    return p? {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,200), items: interactives(p).map(x=>x.label.slice(0,24)).join(' | ')}:'no menu'; })()`);
  reqs.length=0;
  out.pickOther = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=menu],[role=listbox],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1]; if(!p) return 'no menu';
    return clickDeepest(p, /Newest|Recent|Date|Oldest/); })()`);
  await page.waitForTimeout(3500);
  out.afterSort = await page.evaluate(results);
  out.reqAfterSort = reqs.slice(-1)[0] || '(no new request)';
  out.orderChanged = JSON.stringify(out.beforeSort.rows) !== JSON.stringify(out.afterSort.rows);
  return out;
};

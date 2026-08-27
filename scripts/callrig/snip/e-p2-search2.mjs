import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const counts = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return 'no dialog';
  const t=(d.innerText||'').replace(/\\n+/g,' ');
  const m=t.match(/All\\s+(\\d+)\\s+Messages\\s+(\\d+)\\s+Channels\\s+(\\d+)\\s+People\\s+(\\d+)\\s+Files\\s+(\\d+)/);
  return m? 'All='+m[1]+' Msg='+m[2]+' Ch='+m[3]+' Ppl='+m[4]+' Files='+m[5] : 'counts not parsed: '+t.slice(120,260); })()`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url(); if(u.includes('/api/v1/search')) reqs.push(u.replace(/^https:\/\/[^/]+/,'').slice(0,160)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.locator('button[aria-label^="Search "]').first().click();
  await page.waitForTimeout(2200);
  const input = page.locator('[role=dialog] input, input[type=search]').first();
  for (const q of ['qa-e-image','qa-e-image.png','png','zarplex',':in #qa-general probe','probe']) {
    reqs.length=0;
    await input.fill(''); await page.waitForTimeout(500);
    await input.fill(q); await page.waitForTimeout(3200);
    out['q_'+q.replace(/\W+/g,'_')] = {counts: await page.evaluate(counts), req: reqs.slice(-1)[0]||'(none)'};
  }
  // date filters: does the request change?
  await input.fill('probe'); await page.waitForTimeout(2500);
  for (const f of ['Last 7 days','Last 30 days','All time']) {
    reqs.length=0;
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
      const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
      return clickDeepest(d, new RegExp(${JSON.stringify(f)}.replace(/ /g,'\\\\s+'))); })()`);
    await page.waitForTimeout(3000);
    out['filter_'+f.replace(/\W+/g,'_')] = {counts: await page.evaluate(counts), req: reqs.slice(-1)[0]||'(no new request)'};
  }
  return out;
};

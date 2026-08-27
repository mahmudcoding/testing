import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  // delay the search endpoint by 5s
  await page.route('**/api/v1/search?**', async r => { await new Promise(x=>setTimeout(x,5000)); await r.continue(); });
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(1800);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:30});
  // poll from BEFORE the response can arrive
  const samples=[];
  for(let i=0;i<26;i++){
    const s=await page.evaluate(()=>{
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
      if(!d) return null;
      const t=d.innerText.replace(/\s+/g,' ');
      return {noResults:/No results/i.test(t),
        counts:(t.match(/All ?\d* Messages ?\d*/)||[''])[0],
        skeleton: !!d.querySelector('[class*=skeleton i],[class*=animate-pulse],[role=progressbar]'),
        loadingWord:/loading|searching|ищем|загруж/i.test(t),
        rows:[...d.querySelectorAll('[role=option]')].filter(vis).length};
    }).catch(()=>null);
    if(s) samples.push({t:i*300, ...s});
    await page.waitForTimeout(300);
  }
  await page.unroute('**/api/v1/search?**');
  const firstNoRes = samples.find(x=>x.noResults);
  const firstRows  = samples.find(x=>x.rows>0);
  return {n:samples.length,
    falseEmptyBeforeResults: !!(firstNoRes && firstRows && firstNoRes.t < firstRows.t),
    firstNoResultsAt: firstNoRes? firstNoRes.t : null,
    firstRowsAt: firstRows? firstRows.t : null,
    anySkeleton: samples.some(x=>x.skeleton), anyLoadingWord: samples.some(x=>x.loadingWord),
    timeline: samples.filter((x,i)=>i%3===0).map(x=>`${x.t}ms rows=${x.rows} noRes=${x.noResults} skel=${x.skeleton} ${x.counts}`)};
};

import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4OX3463S8ECN8X`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const reqs=[]; const h=r=>{if(/\/api\/v1\/search\?/.test(r.url())) reqs.push(1);};
  page.on('response',h);
  await page.locator('button[aria-label="Search in channel"]').click();
  await page.waitForTimeout(2200);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('archive',{delay:40});
  const samples=[];
  for(let i=0;i<40;i++){          // 12 seconds
    const s=await page.evaluate(()=>{
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
      if(!d) return null;
      const t=d.innerText.replace(/\s+/g,' ');
      const sk=[...d.querySelectorAll('[class*=skeleton i],[class*=animate-pulse],[role=progressbar]')].filter(vis);
      return {skeletonNodes:sk.length, noResults:/No results/i.test(t),
        counts:(t.match(/All ?\d* Messages ?\d*/)||[''])[0],
        rows:[...d.querySelectorAll('[role=option]')].filter(vis).length};
    }).catch(()=>null);
    if(s) samples.push({t:i*300, ...s});
    await page.waitForTimeout(300);
  }
  page.off('response',h);
  return {timeline: samples.map(x=>`${x.t}ms skel=${x.skeletonNodes} rows=${x.rows} noRes=${x.noResults}`).filter((_,i)=>i%2===0), searchRequests:reqs.length,
    skeletonAlways: samples.every(x=>x.skeletonNodes>0),
    skeletonAtEnd: samples[samples.length-1].skeletonNodes,
    everNoResults: samples.some(x=>x.noResults),
    everRows: samples.some(x=>x.rows>0),
    first:samples[0], last:samples[samples.length-1], durationMs:(samples.length-1)*300};
};

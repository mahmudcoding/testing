const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const open = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop();
    return d? /Message everyone/.test(d.innerText||'') : false;},VS);
  if(!open){ await page.locator('button[aria-label="Call chat"]').first().click().catch(()=>{}); await page.waitForTimeout(2800); }
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    // every visible leaf in the chat panel, so an indicator cannot hide behind a text match
    const leaves=[...d.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&(e.innerText||'').trim())
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40));
    const live=[...document.querySelectorAll('[aria-live],[role="status"]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)).filter(Boolean);
    return { leaves, live, leafCount:leaves.length };},VS);
  const base = await read();
  const samples=[]; for(let i=0;i<34;i++){ samples.push(await read()); await page.waitForTimeout(500); }
  const baseSet=new Set(base.leaves);
  const appeared=[...new Set(samples.flatMap(s=>s.leaves).filter(l=>!baseSet.has(l)))];
  return { baselineLeaves:base.leafCount, newLeavesDuringWatch:appeared.slice(0,10),
           liveRegions:[...new Set(samples.flatMap(s=>s.live))].slice(0,6),
           leafCountRange:[Math.min(...samples.map(s=>s.leafCount)),Math.max(...samples.map(s=>s.leafCount))] };
};

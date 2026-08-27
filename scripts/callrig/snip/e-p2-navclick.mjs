import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const results=[];
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.navItems = await page.evaluate(`(() => { ${VISFN}
     const nav=document.querySelector('nav')||document.body;
     return [...new Set([...document.querySelectorAll('a,button')].filter(vis)
       .filter(n=>{const r=n.getBoundingClientRect(); return r.x<300;})
       .map(n=>(n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean))].slice(0,20); })()`);
  const targets = ['Mentions','Directories','Saved Messages','qa-general','qa-private'];
  for (const t of targets) {
    const hit = await page.evaluate(`(() => { ${VISFN}
       const cands=[...document.querySelectorAll('a,button')].filter(vis)
         .filter(n=>{const r=n.getBoundingClientRect(); return r.x<300;})
         .filter(n=>((n.getAttribute('aria-label')||'')+' '+(n.textContent||'')).replace(/\\s+/g,' ').trim().startsWith(${JSON.stringify(t)}));
       const inner=cands.filter(c=>!cands.some(o=>o!==c&&c.contains(o)));
       const el=inner[0]||cands[0]; if(!el) return {none:true};
       const r=el.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if (hit.none) { results.push({target:t, result:'NOT FOUND in left rail'}); continue; }
    await page.mouse.move(hit.cx,hit.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(5500);
    results.push({ target:t, url:page.url().replace(/^https:\/\/[^/]+\/w\/[^/]+/,''),
      head: await page.evaluate(`(() => { ${VISFN}
        const m=document.querySelector('main')||document.body;
        return ((m.innerText||'').replace(/\\s+/g,' ').trim().slice(0,60)); })()`) });
  }
  out.clicks = results;
  return out;
};

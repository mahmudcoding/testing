import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const who = process.env.QA_TARGET || 'QA Bob';
  const out={};
  const b = await page.evaluate((w)=>{
    const hit=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w));
    if(!hit) return null; const r=hit.getBoundingClientRect();
    return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};
  }, who);
  if(!b) return {ok:false};
  await page.mouse.move(b.x+b.w/2, b.y+b.h/2); await page.waitForTimeout(900);
  await page.evaluate((w)=>{
    const hit=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w));
    const t=hit?[...hit.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='participant-tile-card-trigger'):null;
    t&&t.click();
  }, who);
  await page.waitForTimeout(1300);
  out.menu = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    return w?(w.innerText||'').replace(/\s+/g,' ').trim():null;
  });
  for(const item of ['Unpin QA Bob for everyone','Unpin for everyone','Unpin for me']){
    const r = await page.evaluate((i)=>{
      const q=window.__qa;
      const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
      if(!w) return {ok:false};
      const c=[...w.querySelectorAll('button,[role=menuitem],li')].filter(q.vis).filter(n=>q.nameOf(n).replace(/\s+/g,' ').trim()===i);
      if(c.length!==1) return {ok:false,got:c.length};
      c[0].click(); return {ok:true};
    }, item);
    out[item]=r;
    if(r.ok){ await page.waitForTimeout(2200); break; }
  }
  await page.waitForTimeout(1500);
  out.after = await page.evaluate(()=>{
    const q=window.__qa;
    const v=[...document.querySelectorAll('[data-testid="call-view-toggle"]')][0];
    return {tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].map(n=>{const r=n.getBoundingClientRect();
      return (n.innerText||'').replace(/\s+/g,' ').trim().slice(0,20)+' '+Math.round(r.width)+'x'+Math.round(r.height);}),
      viewToggle: v?{n:q.nameOf(v).trim(), d:v.disabled}:null};
  });
  return out;
};

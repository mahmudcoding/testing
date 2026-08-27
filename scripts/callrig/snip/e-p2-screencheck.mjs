import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
// For each finding whose harm should be visible on screen, capture what the user reads.
export default async ({page}) => {
  const out={};
  // finding 13 — recipient's file card claiming "not shared with anyone"
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const t = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const b=[...m.querySelectorAll('button')].filter(vis).find(x=>/^Shared with me$/.test((x.innerText||'').trim()));
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(t){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(220);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(4000); }
  const row = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const el=[...m.querySelectorAll('*')].filter(vis)
       .find(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
                 return /\\.txt|\\.png/.test(own);});
     if(!el) return null; const r=el.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(row){ await page.mouse.move(row.cx,row.cy); await page.waitForTimeout(220);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(3500);
    // open View details from the viewer's More actions
    const more = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog],aside')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
       const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/More actions/i.test(x.getAttribute('aria-label')||x.innerText||''));
       if(!b) return null; const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(more){ await page.mouse.move(more.cx,more.cy); await page.waitForTimeout(220);
      await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
      await page.waitForTimeout(2500);
      const vd = await page.evaluate(`(() => { ${VISFN}
         const it=[...document.querySelectorAll('[role=menuitem],[role=option]')].filter(vis)
           .find(e=>/View details/i.test(e.innerText||''));
         if(!it) return null; const r=it.getBoundingClientRect();
         return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
      if(vd){ await page.mouse.move(vd.cx,vd.cy); await page.waitForTimeout(220);
        await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
        await page.waitForTimeout(4000); } } }
  out.detailsPanel = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog],aside')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>180&&r.height>150;}).pop();
     return d?(d.innerText||'').replace(/\\s+/g,' ').slice(0,260):'(none)'; })()`);
  return out;
};

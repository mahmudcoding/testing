import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for (const run of [1,2]) {
    await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    const click = async re => { const t=await page.evaluate(`(() => { ${VISFN}
        const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis).find(x=>${re}.test((x.textContent||'').trim()));
        if(!b) return {none:true}; const r=b.getBoundingClientRect();
        return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
      if(t.none) return 'not found';
      await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(240);
      await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
      await page.waitForTimeout(3800); return 'clicked'; };
    await click('/^Shared with me$/');
    const tile = await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
         .find(x=>/\\.(txt|png)/i.test(x.getAttribute('aria-label')||x.textContent||''));
       if(!b) return {none:true}; const r=b.getBoundingClientRect();
       return {name:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26),
               cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(tile.none){ out['run'+run]={err:'no tile'}; continue; }
    await page.mouse.click(tile.cx,tile.cy,{button:'right'}); await page.waitForTimeout(2200);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       clickDeepest(document.querySelector('[role=menu]')||document.body, /View details/i); })()`);
    await page.waitForTimeout(4800);
    out['run'+run] = await page.evaluate(`(() => { ${VISFN}
       const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
       const d=c.pop(); if(!d) return {none:true};
       const t=(d.innerText||'').replace(/\\s+/g,' ');
       const i=t.indexOf('SHARED WITH');
       return { hasSharedBy:/Shared by/.test(t),
                sharedWith: i>=0? t.slice(i,i+50):'(section absent)',
                claimsNotShared:/Not shared with anyone yet/.test(t) }; })()`);
    out['run'+run].tile=tile.name;
    await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  }
  out.holds = out.run1 && out.run2 && out.run1.claimsNotShared===true && out.run2.claimsNotShared===true
              && out.run1.hasSharedBy===true;
  return out;
};

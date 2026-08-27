import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/settings/account', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  // enumerate what the settings screen offers
  out.nav = await page.evaluate(`(() => { ${VISFN}
     return [...document.querySelectorAll('button,a,[role=tab]')].filter(vis)
       .map(e=>({tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26),
                 role:e.getAttribute('role')||'', sel:e.getAttribute('aria-selected')}))
       .filter(e=>e.tx).slice(0,26); })()`);
  const prof = page.locator('button,a,[role=tab]').filter({hasText:/^Profile$/}).last();
  out.profileFound = await prof.count();
  if(out.profileFound){
    const b=await prof.boundingBox();
    const frames=[]; const t0=Date.now();
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(250);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    for(let i=0;i<45;i++){
      let f=null;
      try{ f=await page.evaluate(`(() => { ${VISFN}
        const t=(document.body.innerText||'').replace(/\\s+/g,' ');
        const m=t.match(/\\d+ unsaved change\\w*/i);
        return {badge:m?m[0]:null, onProfile:/Display name|Profile photo|About me|Position/i.test(t),
                nInputs:[...document.querySelectorAll('input,textarea')].filter(vis).length,
                head:t.slice(0,60)}; })()`); }
      catch(e){ f={err:String(e.message||e).slice(0,26)}; }
      frames.push({ms:Date.now()-t0, ...f});
      await page.waitForTimeout(300);
    }
    const key=f=>JSON.stringify([f.badge,f.onProfile,f.nInputs,f.err]);
    const kept=[]; let last=null;
    for(const f of frames){ const k=key(f); if(k!==last){kept.push(f); last=k;} }
    out.result={spanMs:frames[frames.length-1].ms,
      everBadge:frames.some(f=>f.badge), everOnProfile:frames.some(f=>f.onProfile),
      badgeFrames:frames.filter(f=>f.badge).map(f=>({ms:f.ms,b:f.badge})).slice(0,6),
      changes:kept.slice(0,8)};
  }
  return out;
};

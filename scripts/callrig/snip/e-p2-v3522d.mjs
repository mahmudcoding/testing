import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const POLL = `(() => { ${VISFN}
   const t=(document.body.innerText||'').replace(/\\s+/g,' ');
   const m=t.match(/\\d+ unsaved change\\w*/i);
   const nodes=[...document.querySelectorAll('*')].filter(e=>{
     const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
     return /unsaved change/i.test(own); });
   return {badge:m?m[0]:null, visBadge:nodes.filter(vis).length, anyBadge:nodes.length,
           onProfile:/Display name|Profile photo|About|Position|Department/i.test(t),
           nInputs:[...document.querySelectorAll('input,textarea')].filter(vis).length}; })()`;
export default async ({page}) => {
  const out={};
  // fresh navigation, polling from the very first frame
  await page.goto(BASE+'/w/'+WS+'/settings/profile', {waitUntil:'domcontentloaded'});
  const run = async (label) => {
    const frames=[]; const t0=Date.now();
    for(let i=0;i<50;i++){
      let f=null;
      try{ f=await page.evaluate(POLL); }catch(e){ f={err:String(e.message||e).slice(0,26)}; }
      frames.push({ms:Date.now()-t0, ...f});
      await page.waitForTimeout(300);
    }
    const key=f=>JSON.stringify([f.badge,f.visBadge,f.anyBadge,f.onProfile,f.nInputs,f.err]);
    const kept=[]; let last=null;
    for(const f of frames){ const k=key(f); if(k!==last){kept.push(f); last=k;} }
    return {label, spanMs:frames[frames.length-1].ms,
      everBadge:frames.some(f=>f.badge), everVisBadge:frames.some(f=>f.visBadge>0),
      everHiddenBadge:frames.some(f=>f.anyBadge>0),
      everOnProfile:frames.some(f=>f.onProfile),
      maxInputs:Math.max(...frames.map(f=>f.nInputs||0)),
      changes:kept.slice(0,8)};
  };
  out.firstOpen = await run('first open');
  await page.reload({waitUntil:'domcontentloaded'});
  out.afterReload = await run('after reload');
  out.url = page.url().replace(BASE,'');
  return out;
};

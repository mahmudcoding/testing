import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/settings/account', {waitUntil:'domcontentloaded'});
  const frames=[]; const t0=Date.now();
  for(let i=0;i<50;i++){
    let f=null;
    try{ f = await page.evaluate(`(() => { ${VISFN}
      const t=(document.body.innerText||'').replace(/\\s+/g,' ');
      const m=t.match(/\\d+ unsaved change\\w*/i);
      const inputs=[...document.querySelectorAll('input,textarea')].filter(vis).length;
      const save=[...document.querySelectorAll('button')].filter(vis)
        .filter(b=>/^(Save|Save changes|Discard)$/.test((b.textContent||'').trim())).length;
      return {badge:m?m[0]:null, loaded:/Display name|Profile|Account/i.test(t),
              nInputs:inputs, nSave:save, head:t.slice(0,70)}; })()`); }
    catch(e){ f={err:String(e.message||e).slice(0,30)}; }
    frames.push({ms:Date.now()-t0, ...f});
    await page.waitForTimeout(300);
  }
  const key=f=>JSON.stringify([f.badge,f.loaded,f.nInputs,f.nSave,f.err]);
  const kept=[]; let last=null;
  for(const f of frames){ const k=key(f); if(k!==last){kept.push(f); last=k;} }
  out.ALK3522={spanMs:frames[frames.length-1].ms,
    everBadge:frames.some(f=>f.badge), everLoaded:frames.some(f=>f.loaded),
    maxInputs:Math.max(...frames.map(f=>f.nInputs||0)),
    url:page.url().replace(BASE,''), changes:kept.slice(0,8)};
  return out;
};

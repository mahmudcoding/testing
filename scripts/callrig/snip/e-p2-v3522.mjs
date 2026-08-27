import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // ALK-3522: opening Profile shows a false "1 unsaved change"
  await page.goto(BASE+'/w/'+WS+'/settings/account', {waitUntil:'domcontentloaded'});
  const frames=[]; const t0=Date.now();
  for(let i=0;i<45;i++){
    let f=null;
    try{ f = await page.evaluate(`(() => { ${VISFN}
      const t=(document.body.innerText||'').replace(/\\s+/g,' ');
      const m=t.match(/\\d+ unsaved change\\w*/i);
      const vis_=[...document.querySelectorAll('*')].filter(e=>{
        const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
        return /unsaved change/i.test(own); }).filter(vis).length;
      return {badge:m?m[0]:null, visNodes:vis_}; })()`); }
    catch(e){ f={err:String(e.message||e).slice(0,30)}; }
    frames.push({ms:Date.now()-t0, ...f});
    await page.waitForTimeout(300);
  }
  const key=f=>JSON.stringify([f.badge,f.visNodes,f.err]);
  const kept=[]; let last=null;
  for(const f of frames){ const k=key(f); if(k!==last){kept.push(f); last=k;} }
  out.ALK3522={spanMs:frames[frames.length-1].ms, everShown:frames.some(f=>f.badge), changes:kept.slice(0,10)};
  return out;
};

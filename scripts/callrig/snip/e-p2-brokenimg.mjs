import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(12000);
  return await page.evaluate(`(() => { ${VISFN}
     const imgs=[...document.querySelectorAll('img')].map(e=>{
       const r=e.getBoundingClientRect();
       return {src:String(e.currentSrc||e.src).split('/api/v1/')[1]||String(e.src).slice(-30),
               complete:e.complete, natW:e.naturalWidth, natH:e.naturalHeight,
               w:Math.round(r.width), h:Math.round(r.height), vis:vis(e)?1:0,
               alt:(e.getAttribute('alt')||'').slice(0,30)};});
     const broken=imgs.filter(i=>i.complete && i.natW===0);
     // what does the message containing it look like?
     let ctx=null;
     const bad=[...document.querySelectorAll('img')].find(e=>e.complete && e.naturalWidth===0);
     if(bad){ const m=bad.closest('[data-message-id]');
       ctx = m ? {text:(m.innerText||'').replace(/\\s+/g,' ').trim().slice(0,140),
                  hasFallbackWord:/unavailable|removed|deleted|not found|недоступ|удал/i.test(m.innerText||''),
                  buttons:[...m.querySelectorAll('button,a')].filter(vis)
                    .map(b=>((b.innerText||'').trim()||b.getAttribute('aria-label')||'').slice(0,22)).slice(0,5)} : {noMessageAncestor:true}; }
     return {nImgs:imgs.length, nBroken:broken.length, broken:broken.slice(0,3), messageContext:ctx}; })()`);
};

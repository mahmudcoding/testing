import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  // locate the video row's vertical band, then list EVERY interactive node in that band
  const band = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const el=[...m.querySelectorAll('*')].filter(vis)
       .find(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
                 return /e2video\\.mp4/.test(own);});
     if(!el) return null; const r=el.getBoundingClientRect();
     return {top:Math.round(r.top), bottom:Math.round(r.bottom), left:Math.round(r.left)}; })()`);
  if(!band) return {err:'video row text not found'};
  const before = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     return [...m.querySelectorAll('button,a,[role=button],[role=switch],[role=checkbox],input')]
       .map(e=>{const r=e.getBoundingClientRect();
         return {tag:e.tagName, al:(e.getAttribute('aria-label')||'').slice(0,30),
                 tx:(e.innerText||'').trim().slice(0,18), y:Math.round(r.top),
                 cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2),
                 pressed:e.getAttribute('aria-pressed'), vis:vis(e)?1:0};})
       .filter(e=>e.y>=${band.top}-30 && e.y<=${band.bottom}+30); })()`);
  const out={band, inBandBeforeHover:before};
  // hover the row — row actions often only mount on hover
  await page.mouse.move(band.left+200, (band.top+band.bottom)/2);
  await page.waitForTimeout(1500);
  out.inBandAfterHover = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     return [...m.querySelectorAll('button,a,[role=button],[role=switch],[role=checkbox]')]
       .map(e=>{const r=e.getBoundingClientRect();
         return {tag:e.tagName, al:(e.getAttribute('aria-label')||'').slice(0,30),
                 tx:(e.innerText||'').trim().slice(0,18), y:Math.round(r.top),
                 cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2),
                 pressed:e.getAttribute('aria-pressed'), vis:vis(e)?1:0};})
       .filter(e=>e.y>=${band.top}-30 && e.y<=${band.bottom}+30); })()`);
  return out;
};

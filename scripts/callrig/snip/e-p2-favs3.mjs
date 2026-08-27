import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const band = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const els=[...m.querySelectorAll('*')].filter(vis)
       .filter(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
                   return /e2video\\.mp4/.test(own);});
     return els.map(e=>{const r=e.getBoundingClientRect();
       return {tag:e.tagName, top:Math.round(r.top), bottom:Math.round(r.bottom),
               left:Math.round(r.left), right:Math.round(r.right)};}); })()`);
  const target = (band||[]).filter(b=>b.left>350).sort((a,b)=>a.top-b.top)[0] || (band||[])[0];
  if(!target) return {err:'no e2video row', band};
  const scan = `(() => { ${VISFN}
     const m=document.querySelector('main');
     return [...m.querySelectorAll('button,a,[role=button],[role=switch],[role=checkbox]')]
       .map(e=>{const r=e.getBoundingClientRect();
         return {al:(e.getAttribute('aria-label')||'').slice(0,32), tx:(e.innerText||'').trim().replace(/\\s+/g,' ').slice(0,18),
                 x:Math.round(r.left), y:Math.round(r.top), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2),
                 pressed:e.getAttribute('aria-pressed'), vis:vis(e)?1:0};})
       .filter(e=>e.x>350 && e.y>=${target.top}-26 && e.y<=${target.bottom}+26); })()`;
  const out={target, band};
  out.beforeHover = await page.evaluate(scan);
  await page.mouse.move(target.left+120, Math.round((target.top+target.bottom)/2));
  await page.waitForTimeout(1600);
  out.afterHover = await page.evaluate(scan);
  return out;
};

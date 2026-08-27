import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type('viewer'); await page.waitForTimeout(4500);
  return await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const o=[...d.querySelectorAll('[role=option]')].filter(vis)
       .find(x=>/Open channel with file/.test(x.textContent||''));
     if(!o) return {err:'no row'};
     // find the node that actually carries the phrase
     const walk=[...o.querySelectorAll('*')].filter(e=>{
       const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
       return /Open channel with file/.test(own); });
     const info = walk.map(e=>{const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
       return {tag:e.tagName, cls:(e.className||'').toString().slice(0,44),
               w:Math.round(r.width), h:Math.round(r.height),
               pos:cs.position, clip:cs.clip, ov:cs.overflow, op:cs.opacity,
               srOnly:/sr-only|visually-hidden/.test((e.className||'').toString())};});
     return {innerText:(o.innerText||'').replace(/\\s+/g,' ').slice(0,80),
             textContent:(o.textContent||'').replace(/\\s+/g,' ').slice(0,80),
             carriers:info}; })()`);
};

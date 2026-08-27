import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(12000);
  return await page.evaluate(`(() => { ${VISFN}
     const bad=[...document.querySelectorAll('img')].find(e=>e.complete&&e.naturalWidth===0);
     if(!bad) return {err:'no broken img'};
     const m=bad.closest('[data-message-id]');
     if(!m) return {err:'no message ancestor'};
     const mr=m.getBoundingClientRect();
     // why is the img not visible? walk its ancestors
     const chain=[]; let n=bad;
     for(let i=0;i<6&&n&&n!==document.body;i++){
       const cs=getComputedStyle(n); const r=n.getBoundingClientRect();
       chain.push({tag:n.tagName, disp:cs.display, vis_:cs.visibility, op:cs.opacity,
                   ov:cs.overflow, w:Math.round(r.width), h:Math.round(r.height)});
       n=n.parentElement; }
     // everything visible inside the message
     const inner=[...m.querySelectorAll('*')].filter(vis)
       .filter(e=>{const own=[...e.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent.trim()).join('');
                   return own.length>0;})
       .map(e=>(e.textContent||'').trim().replace(/\\s+/g,' ').slice(0,40));
     return {msgRect:{w:Math.round(mr.width), h:Math.round(mr.height)},
             msgVisible:vis(m)?1:0,
             imgAncestorChain:chain,
             visibleTextNodes:[...new Set(inner)].slice(0,8),
             msgInnerText:(m.innerText||'').replace(/\\s+/g,' ').trim().slice(0,120)}; })()`);
};

import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const tile = await page.evaluate(`(() => { ${VISFN}
    const t=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
      .find(b=>/\\.(png|txt|jpg|pdf)/i.test(b.getAttribute('aria-label')||b.textContent||''));
    if(!t) return null; const r=t.getBoundingClientRect();
    return {label:(t.getAttribute('aria-label')||t.textContent||'').trim().slice(0,34),
            cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.tile=tile; if(!tile) return out;
  await page.mouse.click(tile.cx, tile.cy, {button:'right'}); await page.waitForTimeout(2200);
  out.menu = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelectorAll('[role=menuitem],[role=menu] button')].filter(vis)
       .map(n=>(n.textContent||'').trim()).filter(Boolean))].slice(0,10); })()`);
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const root=document.querySelector('[role=menu]')||document.body;
     return clickDeepest(root, /View details/i); })()`);
  await page.waitForTimeout(5000);
  out.panel = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     const d=c.pop(); if(!d) return {none:true, body:((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(-200)};
     return { text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,300),
              controls:[...new Set([...d.querySelectorAll('button,a[href]')].filter(vis)
                .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean))].slice(0,12) }; })()`);
  return out;
};

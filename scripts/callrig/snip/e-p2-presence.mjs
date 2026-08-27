import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis)
       .find(x=>/^Profile$/.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
     if(!b) return {none:true, rail:[...document.querySelectorAll('button')].filter(vis)
       .filter(n=>n.getBoundingClientRect().x<300)
       .map(n=>(n.getAttribute('aria-label')||n.textContent||'').trim().slice(0,24)).slice(0,14)};
     const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.profileBtn=t; if(t.none) return out;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
  await page.waitForTimeout(3500);
  out.menu = await page.evaluate(`(() => { ${VISFN}
     const items=[...document.querySelectorAll('[role=menuitem],[role=menu] button,[data-state=open] button,[role=dialog] button')].filter(vis)
       .map(n=>(n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
     return [...new Set(items)].slice(0,18); })()`);
  out.menuText = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=menu],[data-state=open],[role=dialog]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>140&&r.height>60;});
     const d=c.pop(); return d? (d.innerText||'').replace(/\\s+/g,' ').slice(0,260):'(none)'; })()`);
  await page.keyboard.press('Escape');
  return out;
};

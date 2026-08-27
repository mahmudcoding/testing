import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, cx, cy) => { await page.mouse.move(cx,cy); await page.waitForTimeout(220);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); await page.waitForTimeout(2600); };
const ROOT = `(() => { const h=document.documentElement; const o={};
   for(const a of h.getAttributeNames()) if(a.startsWith('data-')) o[a]=h.getAttribute(a);
   const cs=getComputedStyle(h);
   o['--accent']=cs.getPropertyValue('--accent').trim()||cs.getPropertyValue('--c-accent').trim();
   return o; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/settings/appearance', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.before = await page.evaluate(ROOT);
  // enumerate every toggle-ish control with its state
  out.controls = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const nav=/^(Account|Profile|Notifications|Appearance|Calls and audio|Privacy & security|Sessions|Security|About|Company|Workspace|Roles|Company dashboard|Members)$/;
     return [...m.querySelectorAll('button,[role=switch],[role=radio]')].filter(vis)
       .map(e=>({tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,22),
                 role:e.getAttribute('role')||'', pressed:e.getAttribute('aria-pressed'),
                 checked:e.getAttribute('aria-checked'),
                 cx:Math.round(e.getBoundingClientRect().x+e.getBoundingClientRect().width/2),
                 cy:Math.round(e.getBoundingClientRect().y+e.getBoundingClientRect().height/2)}))
       .filter(e=>!nav.test(e.tx)); })()`);
  // toggle Density -> Compact and see the root attribute change
  const dens = (out.controls||[]).find(c=>c.tx==='Compact');
  if(dens){ await mc(page, dens.cx, dens.cy); out.afterCompact = await page.evaluate(ROOT); }
  // find and flip the Animations switch (a switch with no text; identify by context)
  const anim = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const sw=[...m.querySelectorAll('[role=switch]')].filter(vis).map(e=>{
       let n=e,ctx='';
       for(let k=0;k<5&&n;k++){ n=n.parentElement;
         if(n){const s=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(s.length>10){ctx=s.slice(0,70);break;}}}
       const r=e.getBoundingClientRect();
       return {checked:e.getAttribute('aria-checked'), ctx,
               cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)};});
     return sw.filter(x=>/animation/i.test(x.ctx))[0]||null; })()`);
  out.animSwitch = anim;
  if(anim){ await mc(page, anim.cx, anim.cy); out.afterAnimToggle = await page.evaluate(ROOT);
    await mc(page, anim.cx, anim.cy); out.afterAnimRestore = await page.evaluate(ROOT); }
  // restore density
  const cozy = (out.controls||[]).find(c=>c.tx==='Cozy');
  if(cozy){ await mc(page, cozy.cx, cozy.cy); out.restored = await page.evaluate(ROOT); }
  return out;
};

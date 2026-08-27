import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const PANEL = `(() => { ${VISFN}
   const d=[...document.querySelectorAll('[role=dialog]')]
     .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
   if(!d) return {open:false};
   const btns=[...d.querySelectorAll('button')].filter(vis)
     .map(b=>({tx:(b.textContent||'').trim().replace(/\\s+/g,' ').slice(0,18),
               checked:b.getAttribute('aria-checked'), pressed:b.getAttribute('aria-pressed')}));
   return {open:true, head:(d.innerText||'').replace(/\\s+/g,' ').slice(0,80), btns:btns.slice(0,16)}; })()`;
export default async ({page}) => {
  const out={};
  for(const route of ['/files','/calendar','/directories?tab=people']){
    await page.goto(BASE+'/w/'+WS+route, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8500);
    for(const combo of ['Meta+Shift+T','Control+Shift+T']){
      await page.keyboard.press(combo); await page.waitForTimeout(2200);
      const p = await page.evaluate(PANEL);
      if(p.open && /Display|Theme|Density/i.test(p.head)){ out.route=route; out.combo=combo; out.panel=p; return out; }
      if(p.open) await page.keyboard.press('Escape');
      await page.waitForTimeout(600);
    }
  }
  // fall back: hunt for a menu entry that opens it
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.menuHunt = await page.evaluate(`(() => { ${VISFN}
     return [...document.querySelectorAll('button,a,[role=menuitem]')].filter(vis)
       .map(e=>((e.innerText||'').replace(/\\s+/g,' ').trim()||e.getAttribute('aria-label')||'').slice(0,26))
       .filter(t=>/display|theme|appearance|zoom|density/i.test(t)); })()`);
  out.note='panel not opened on any route';
  return out;
};

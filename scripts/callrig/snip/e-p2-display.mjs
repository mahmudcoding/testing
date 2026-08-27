import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const PANEL = `(() => { ${VISFN}
   const d=[...document.querySelectorAll('[role=dialog]')]
     .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
   if(!d) return {open:false};
   const btns=[...d.querySelectorAll('button')].filter(vis)
     .map(b=>({tx:(b.textContent||'').trim().replace(/\\s+/g,' ').slice(0,18),
               checked:b.getAttribute('aria-checked'), pressed:b.getAttribute('aria-pressed')}));
   return {open:true, head:(d.innerText||'').replace(/\\s+/g,' ').slice(0,70), btns:btns.slice(0,16)}; })()`;
const ROOT = `(() => ({theme:document.documentElement.getAttribute('data-theme'),
   density:document.documentElement.getAttribute('data-density'),
   scale:document.documentElement.getAttribute('data-font-scale')
        ||getComputedStyle(document.documentElement).getPropertyValue('--font-scale').trim(),
   prefersDark:matchMedia('(prefers-color-scheme: dark)').matches}))()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.rootBefore = await page.evaluate(ROOT);
  for(const combo of ['Meta+Shift+T','Control+Shift+T']){
    await page.keyboard.press(combo); await page.waitForTimeout(2500);
    const p = await page.evaluate(PANEL);
    if(p.open){ out.openedWith=combo; out.panel=p; break; }
  }
  if(!out.panel) { out.note='panel did not open with either combo'; return out; }
  return out;
};

import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const PANEL = `(() => { ${VISFN}
   const cands=[...document.querySelectorAll('aside,[role=dialog],[role=complementary]')]
     .filter(e=>{const r=e.getBoundingClientRect(); return r.width>180&&r.height>150;})
     .filter(e=>/Display settings/i.test(e.innerText||''));
   const d=cands.pop();
   if(!d) return {open:false};
   const btns=[...d.querySelectorAll('button')].filter(vis)
     .map(b=>({tx:(b.textContent||'').trim().replace(/\\s+/g,' ').slice(0,16),
               checked:b.getAttribute('aria-checked'), pressed:b.getAttribute('aria-pressed')}));
   return {open:true, tag:d.tagName, head:(d.innerText||'').replace(/\\s+/g,' ').slice(0,90), btns}; })()`;
const ROOT = `(() => { const h=document.documentElement; const o={};
   for(const a of h.getAttributeNames()) if(a.startsWith('data-')) o[a]=h.getAttribute(a);
   o['prefersDark']=String(matchMedia('(prefers-color-scheme: dark)').matches); return o; })()`;
const pick = async (page, label) => {
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('aside,[role=dialog]')]
       .filter(e=>/Display settings/i.test(e.innerText||'')).pop();
     const b=[...d.querySelectorAll('button')].filter(vis)
       .find(x=>(x.textContent||'').trim()===${JSON.stringify(label)});
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t) return false;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(220);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(1600); return true;
};
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.keyboard.press('Meta+Shift+T'); await page.waitForTimeout(2600);
  out.panel = await page.evaluate(PANEL);
  if(!out.panel.open) return out;
  out.rootBefore = await page.evaluate(ROOT);
  out.picks = {dark: await pick(page,'Dark'), compact: await pick(page,'Compact'), xl: await pick(page,'XL')};
  out.rootAfterChanges = await page.evaluate(ROOT);
  out.stateAfterChanges = await page.evaluate(PANEL);
  out.resetClicked = await pick(page,'Reset all');
  await page.waitForTimeout(2500);
  out.rootAfterReset = await page.evaluate(ROOT);
  out.stateAfterReset = await page.evaluate(PANEL);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8500);
  out.rootAfterReload = await page.evaluate(ROOT);
  return out;
};

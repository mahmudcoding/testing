import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const ROOT = `(() => { const h=document.documentElement; const o={};
   for(const a of h.getAttributeNames()) if(a.startsWith('data-')) o[a]=h.getAttribute(a); return o; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/settings/appearance', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  // enumerate ALL switches regardless of fold, with the label text of their row
  const list = `(() => {
     const m=document.querySelector('main');
     return [...m.querySelectorAll('[role=switch]')].map((e,i)=>{
       let n=e,ctx='';
       for(let k=0;k<6&&n;k++){ n=n.parentElement;
         if(n){const s=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(s.length>10&&s.length<160){ctx=s.slice(0,70);break;}}}
       const r=e.getBoundingClientRect();
       return {i, checked:e.getAttribute('aria-checked'), ctx, y:Math.round(r.top)};}); })()`;
  out.switches = await page.evaluate(list);
  const target = (out.switches||[]).find(s=>/animation/i.test(s.ctx));
  out.target = target||null;
  if(target){
    const loc = page.locator('main [role=switch]').nth(target.i);
    await loc.scrollIntoViewIfNeeded(); await page.waitForTimeout(900);
    const b = await loc.boundingBox();
    out.before = await page.evaluate(ROOT);
    await page.mouse.move(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(220);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(2600);
    out.stateAfter = await page.evaluate(`(() => { const s=document.querySelectorAll('main [role=switch]')[${target.i}];
       return s?s.getAttribute('aria-checked'):null; })()`);
    out.after = await page.evaluate(ROOT);
    // restore
    await page.mouse.move(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(200);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(2200);
    out.restored = await page.evaluate(ROOT);
  }
  return out;
};

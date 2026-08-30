/* sector L: does the device list show which device is currently in use? Full markup + styles. */
import { DOM } from './lib.mjs';
const openPop = async (page) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.evaluate(()=>{const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim())); b&&b.click();});
  await page.waitForTimeout(1700);
};
const rows = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
  if(!w) return null;
  const btns=[...w.querySelectorAll('button')].filter(b=>/Fake (Default )?Audio/i.test(q.nameOf(b)));
  return btns.map(b=>{
    const cs=getComputedStyle(b);
    const before=getComputedStyle(b,'::before'), after=getComputedStyle(b,'::after');
    return {name:q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,45),
      cls:(b.className||'').toString(),
      attrs:[...b.attributes].map(a=>a.name+'='+String(a.value).slice(0,40)),
      bg:cs.backgroundColor, color:cs.color, fontWeight:cs.fontWeight, border:cs.borderColor,
      beforeContent:before.content, afterContent:after.content,
      childTags:[...b.children].map(c=>c.tagName+'.'+(c.className||'').toString().slice(0,25)),
      innerHTMLlen:b.innerHTML.length,
      innerHTML:b.innerHTML.replace(/\s+/g,' ').slice(0,220)};
  });
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  await openPop(page);
  out.before = await rows(page);
  out.pick = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return {ok:false};
    const c=[...w.querySelectorAll('button')].filter(q.vis).filter(b=>/^Fake Audio Output 2/.test(q.nameOf(b).replace(/\s+/g,' ').trim()));
    if(c.length!==1) return {ok:false, got:c.length};
    c[0].click(); return {ok:true};
  });
  await page.waitForTimeout(2500);
  out.sinkAfter = await page.evaluate(()=>[...document.querySelectorAll('audio')].map(a=>(a.sinkId||'(default)').slice(0,16)));
  await openPop(page);
  out.after = await rows(page);
  await page.keyboard.press('Escape');
  return out;
};

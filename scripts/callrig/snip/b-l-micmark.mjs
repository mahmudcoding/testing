/* sector L: is the microphone in use marked in the picker? Speaker half is the control. */
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
  // section headings tell input from output
  const btns=[...w.querySelectorAll('button')].filter(b=>/Fake (Default )?Audio/i.test(q.nameOf(b)));
  return btns.map(b=>{
    const cs=getComputedStyle(b);
    const marked = cs.backgroundColor!=='rgba(0, 0, 0, 0)' || cs.color!=='rgb(17, 20, 26)';
    return {name:q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,42),
      kind: /Input/i.test(q.nameOf(b))?'mic':'speaker',
      marked, bg:cs.backgroundColor, color:cs.color,
      ariaChecked:b.getAttribute('aria-checked'), ariaSelected:b.getAttribute('aria-selected'),
      role:b.getAttribute('role'), dataState:b.getAttribute('data-state')};
  });
});
const senderMic = async (page) => page.evaluate(()=>{
  const s=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    for(const t of pc.getSenders()) if(t.track&&t.track.kind==='audio') s.push(t.track.label); }
  return s;
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.senderBefore = await senderMic(page);
  await openPop(page);
  out.a_initial = await rows(page);
  // now explicitly pick a non-default microphone
  out.pick = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return {ok:false};
    const c=[...w.querySelectorAll('button')].filter(q.vis).filter(b=>/^Fake Audio Input 1/.test(q.nameOf(b).replace(/\s+/g,' ').trim()));
    if(c.length!==1) return {ok:false, got:c.length};
    c[0].click(); return {ok:true};
  });
  await page.waitForTimeout(3000);
  out.senderAfter = await senderMic(page);
  await openPop(page);
  out.b_afterPick = await rows(page);
  // and pick a speaker, as the in-popover control
  out.pickSpk = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return {ok:false};
    const c=[...w.querySelectorAll('button')].filter(q.vis).filter(b=>/^Fake Audio Output 1/.test(q.nameOf(b).replace(/\s+/g,' ').trim()));
    if(c.length!==1) return {ok:false, got:c.length};
    c[0].click(); return {ok:true};
  });
  await page.waitForTimeout(2500);
  await openPop(page);
  out.c_afterSpk = await rows(page);
  out.sinks = await page.evaluate(()=>[...document.querySelectorAll('audio')].map(a=>(a.sinkId||'(default)').slice(0,12)));
  await page.keyboard.press('Escape');
  return out;
};

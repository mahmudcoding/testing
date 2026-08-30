/* sector L: confirm on a second client + the camera picker */
import { DOM } from './lib.mjs';
const open = async (page, which) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.evaluate((w)=>{const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>new RegExp('^Select '+w+'$','i').test(q.nameOf(x).trim())); b&&b.click();}, which);
  await page.waitForTimeout(1700);
};
const rows = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
  if(!w) return null;
  const btns=[...w.querySelectorAll('button')].filter(b=>/Fake|Device ID|System default/i.test(q.nameOf(b)));
  return btns.map(b=>{const cs=getComputedStyle(b);
    return {name:q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,44),
      marked: cs.backgroundColor!=='rgba(0, 0, 0, 0)' || cs.color!=='rgb(17, 20, 26)',
      bg:cs.backgroundColor, color:cs.color, ariaChecked:b.getAttribute('aria-checked'), role:b.getAttribute('role')};});
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.tracks = await page.evaluate(()=>{
    const s=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
      for(const t of pc.getSenders()) if(t.track) s.push(t.track.kind+':'+t.track.label); }
    return s;
  });
  out.sinks = await page.evaluate(()=>[...document.querySelectorAll('audio')].map(a=>(a.sinkId||'(default)').slice(0,12)));
  await open(page,'microphone');
  out.audioPicker = await rows(page);
  await open(page,'camera');
  out.cameraPicker = await rows(page);
  await page.keyboard.press('Escape');
  return out;
};

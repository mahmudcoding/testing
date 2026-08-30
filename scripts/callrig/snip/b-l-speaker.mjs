/* sector L: speaker selection in the audio popover — does it reach the audio elements' sinkId? */
import { DOM } from './lib.mjs';
const audio = async (page) => page.evaluate(()=>{
  const els=[...document.querySelectorAll('audio')];
  return {count:els.length,
    sinks:els.map(a=>({sink:(a.sinkId===''?'(default)':a.sinkId||'').slice(0,16), vol:a.volume, paused:a.paused})),
    hasSetSinkId: typeof HTMLMediaElement.prototype.setSinkId === 'function'};
});
const openPop = async (page) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(()=>{const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim())); b&&b.click();});
  await page.waitForTimeout(1600);
};
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.devices = await page.evaluate(async ()=>(await navigator.mediaDevices.enumerateDevices())
    .filter(d=>d.kind==='audiooutput').map(d=>({label:d.label, id:d.deviceId.slice(0,16)})));
  out.a_before = await audio(page);
  await openPop(page);
  // what is marked as selected before we touch anything?
  out.selectedMarkers = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return null;
    const btns=[...w.querySelectorAll('button')].filter(q.vis);
    return btns.map(b=>({name:q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,50),
      checked:b.getAttribute('aria-checked'), sel:b.getAttribute('aria-selected'),
      pressed:b.getAttribute('aria-pressed'), state:b.getAttribute('data-state'),
      hasSvg:!!b.querySelector('svg'), svgCount:b.querySelectorAll('svg').length,
      cls:(b.className||'').toString().slice(0,70)}));
  });
  // pick "Fake Audio Output 1"
  out.pick = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return {ok:false};
    const c=[...w.querySelectorAll('button')].filter(q.vis).filter(b=>/^Fake Audio Output 1/.test(q.nameOf(b).replace(/\s+/g,' ').trim()));
    if(c.length!==1) return {ok:false, got:c.length};
    c[0].click(); return {ok:true};
  });
  await page.waitForTimeout(2500);
  out.b_after = await audio(page);
  await page.waitForTimeout(2500);
  out.c_after2 = await audio(page);
  // re-open and see what is marked now
  await openPop(page);
  out.markersAfter = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return null;
    return [...w.querySelectorAll('button')].filter(q.vis).map(b=>({name:q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,45),
      svgCount:b.querySelectorAll('svg').length, checked:b.getAttribute('aria-checked'), state:b.getAttribute('data-state')}));
  });
  await page.keyboard.press('Escape');
  return out;
};

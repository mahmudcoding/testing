/* sector L: the Call volume slider in the audio popover — does it change the audio output? */
import { DOM } from './lib.mjs';
const audioState = async (page) => page.evaluate(()=>{
  const els=[...document.querySelectorAll('audio')];
  return {count:els.length, vols:els.map(a=>({v:a.volume, muted:a.muted, paused:a.paused, hasSrc:!!a.srcObject})),
    slider:(()=>{const s=document.querySelector('[data-testid="audio-mix-slider-main"]');
      return s?{value:s.value, min:s.min, max:s.max, aria:s.getAttribute('aria-valuenow'), type:s.type}:null;})()};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  const out={};
  out.a_closed = await audioState(page);
  // open the popover
  await page.evaluate(()=>{const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim())); b&&b.click();});
  await page.waitForTimeout(1500);
  out.b_open = await audioState(page);
  // set the slider to 25 with native setter + input/change (React-controlled range)
  out.set25 = await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="audio-mix-slider-main"]');
    if(!s) return {ok:false};
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(s,'25');
    s.dispatchEvent(new Event('input',{bubbles:true}));
    s.dispatchEvent(new Event('change',{bubbles:true}));
    return {ok:true, valueNow:s.value};
  });
  await page.waitForTimeout(1800);
  out.c_at25 = await audioState(page);
  out.popoverText = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    return w?(w.innerText||'').replace(/\s+/g,' ').trim().slice(-120):null;
  });
  // drag it with the keyboard too, as a user would
  out.keyboard = await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="audio-mix-slider-main"]');
    if(!s) return {ok:false}; s.focus(); return {ok:true, focused:document.activeElement===s};
  });
  for(let i=0;i<5;i++){ await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(200); }
  await page.waitForTimeout(1200);
  out.d_afterKeys = await audioState(page);
  // restore to 100
  await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="audio-mix-slider-main"]');
    if(!s) return;
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(s,'100'); s.dispatchEvent(new Event('input',{bubbles:true})); s.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.waitForTimeout(1500);
  out.e_restored = await audioState(page);
  await page.keyboard.press('Escape');
  return out;
};

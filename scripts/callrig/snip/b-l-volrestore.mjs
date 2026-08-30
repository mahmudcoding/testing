import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(()=>{const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim())); b&&b.click();});
  await page.waitForTimeout(1500);
  const r = await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="audio-mix-slider-main"]');
    if(!s) return {ok:false};
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(s,'100'); s.dispatchEvent(new Event('input',{bubbles:true})); s.dispatchEvent(new Event('change',{bubbles:true}));
    return {ok:true, v:s.value};
  });
  await page.waitForTimeout(1200);
  await page.keyboard.press('Escape');
  const vols = await page.evaluate(()=>[...document.querySelectorAll('audio')].map(a=>a.volume));
  return {r, vols};
};

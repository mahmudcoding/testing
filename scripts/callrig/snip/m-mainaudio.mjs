import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const b = await page.$('[data-testid="main-audio-trigger"]');
  const out = {found: !!b};
  if (!b) return out;
  out.label = await b.evaluate(e=>(e.getAttribute('aria-label')||e.textContent||'').trim());
  const bb = await b.boundingBox();
  await page.mouse.click(bb.x+bb.width/2, bb.y+bb.height/2);
  await page.waitForTimeout(1500);
  out.popover = await page.evaluate(()=>{
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const c=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper],[role=menu]')].filter(vis);
    const m=c[c.length-1]; if(!m) return null;
    return {text:T(m), controls:[...m.querySelectorAll('button,input,[role=slider],[role=switch]')].filter(vis).map(x=>({
      tag:x.tagName, role:x.getAttribute('role'), l:(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,40),
      t:x.getAttribute('data-testid'), val:x.getAttribute('aria-valuenow')||x.value, min:x.min, max:x.max,
      box:(()=>{const r=x.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];})()}))};
  });
  return out;
};

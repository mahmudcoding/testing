import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const b = await page.$('button[aria-label="Send reaction"]');
  if (!b) return {err:'no Send reaction'};
  const bb = await b.boundingBox();
  await page.mouse.click(bb.x+bb.width/2, bb.y+bb.height/2);
  await page.waitForTimeout(1500);
  const opts = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const c=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper],[role=dialog]')].filter(vis);
    const m=c[c.length-1]; if(!m) return null;
    return [...m.querySelectorAll('button')].filter(vis).map(x=>({l:(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,30),
      box:(()=>{const r=x.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];})()}));});
  const out = {opts};
  const want = process.env.QA_EMOJI || null;
  if (opts && opts.length) {
    const pick = want ? opts.find(o=>o.l.includes(want)) : opts[0];
    if (pick) { out.picked = pick.l; out.sendEpoch = Date.now();
      await page.mouse.click(pick.box[0]+pick.box[2]/2, pick.box[1]+pick.box[3]/2); await page.waitForTimeout(2000); }
  }
  return out;
};

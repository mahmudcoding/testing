import { VIS } from './a-nb-lib.mjs';
const ST = `() => {
  const o={};
  for (const t of ['header-tab-main-activate','header-tab-room-activate']) {
    const e=document.querySelector('[data-testid="'+t+'"]');
    o[t]= e? e.getAttribute('aria-pressed') : null;
  }
  const p=document.querySelector('[data-testid="call-side-panel-slot"]');
  o.chat = p? (p.innerText||'').replace(/\\s+/g,' ').slice(0,60) : null;
  return o;
}`;
export default async ({page}) => {
  const tid = process.env.QA_TAB_TID || 'header-tab-main-activate';
  const out={tid};
  await page.mouse.move(700,400); await page.waitForTimeout(500);
  out.before = await page.evaluate('('+ST+')()');
  const box = await page.locator(`[data-testid="${tid}"]`).first().boundingBox();
  out.box = box;
  if (box) { await page.mouse.click(box.x+box.width/2, box.y+box.height/2); await page.waitForTimeout(4000); }
  out.afterMouse = await page.evaluate('('+ST+')()');
  if (out.afterMouse[tid] !== 'true') {
    await page.evaluate((t)=>document.querySelector('[data-testid="'+t+'"]').click(), tid);
    await page.waitForTimeout(4000);
    out.afterDomClick = await page.evaluate('('+ST+')()');
  }
  return out;
};

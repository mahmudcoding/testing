/* Reload, ensure the participants panel is open, admit the named person. */
import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(DOM);
  out.pressed0 = await page.evaluate(()=>document.querySelector('[data-testid="call-controls-people-toggle"]')?.getAttribute('aria-pressed'));
  if (out.pressed0 !== 'true') { await safeClick(page,'[data-testid="call-controls-people-toggle"]').catch(()=>{}); await page.waitForTimeout(3500); }
  await page.evaluate(DOM);
  out.panel = await page.evaluate(()=>{
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
    return (ov?ov.innerText:'').replace(/\s+/g,' ').slice(0,500);
  });
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Admit /i));
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);
  out.after = await page.evaluate(()=>{
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
    return (ov?ov.innerText:'').replace(/\s+/g,' ').slice(0,400);
  });
  return out;
};

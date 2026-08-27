import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(600);
  await page.evaluate(DOM);
  await page.locator('button[aria-label="Add to call"]').first().click({timeout:15000}).catch(e=>out.err=String(e).slice(0,90));
  await page.waitForTimeout(2800);
  await page.evaluate(DOM);
  out.link = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    const inp=[...d.querySelectorAll('input')].map(i=>i.value).filter(v=>/https?:\/\//.test(v));
    const txt=(d.innerText||'').match(/https?:\/\/\S+/);
    return { inputs: inp, fromText: txt? txt[0]:null };
  });
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};

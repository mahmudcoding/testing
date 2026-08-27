import { VIS } from './a-nb-lib.mjs';
const VOLS = `() => [...document.querySelectorAll('audio')].map(e=>e.volume)`;
export default async ({page}) => {
  const tid = process.env.QA_TID || 'audio-mix-slider-main';
  const out={tid};
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(400);
  await page.locator('button[aria-label="Select microphone"]').first().click();
  await page.waitForTimeout(2200);
  out.before = {vols: await page.evaluate('('+VOLS+')()'),
    val: await page.evaluate((t)=>{const s=document.querySelector('[data-testid="'+t+'"]'); return s?s.value:null;}, tid)};
  const s = page.locator(`[data-testid="${tid}"]`).first();
  if (!(await s.count())) { out.err='no slider'; return out; }
  await s.focus();
  await page.keyboard.press('End'); await page.waitForTimeout(1800);
  out.atMax = {vols: await page.evaluate('('+VOLS+')()'),
    val: await page.evaluate((t)=>document.querySelector('[data-testid="'+t+'"]').value, tid),
    label: await page.evaluate((v)=>{const vis=eval(v);
      const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
        .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
      const m=cands[cands.length-1]; return m?(m.innerText||'').replace(/\n/g,' | ').slice(-120):null;}, VIS)};
  await page.keyboard.press('Home'); await page.waitForTimeout(1800);
  out.atMin = {vols: await page.evaluate('('+VOLS+')()'),
    val: await page.evaluate((t)=>document.querySelector('[data-testid="'+t+'"]').value, tid)};
  // restore to 30
  const back=Number(process.env.QA_BACK||30); for (let i=0;i<back;i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(1500);
  out.restored = {vols: await page.evaluate('('+VOLS+')()'),
    val: await page.evaluate((t)=>document.querySelector('[data-testid="'+t+'"]').value, tid)};
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};

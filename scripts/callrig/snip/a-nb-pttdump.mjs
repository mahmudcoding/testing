import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(400);
  await page.locator('button[aria-label="Select microphone"]').first().click();
  await page.waitForTimeout(2200);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1]; if(!m) return {err:'no popover'};
    // the block containing the words "Push to talk"
    const blocks=[...m.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes('Push to talk'))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length).slice(0,2);
    return blocks.map(b=>({txt:(b.innerText||'').replace(/\s+/g,' ').slice(0,80),
      nodes:[...b.querySelectorAll('*')].filter(vis).map(e=>({tag:e.tagName.toLowerCase(),
        role:e.getAttribute('role'), t:e.getAttribute('data-testid'), al:e.getAttribute('aria-label'),
        st:e.getAttribute('aria-checked')||e.getAttribute('data-state')||e.getAttribute('aria-pressed')||null,
        txt:(e.childElementCount===0?(e.textContent||'').trim().slice(0,26):'')})).slice(0,12)})); }, VIS);
};

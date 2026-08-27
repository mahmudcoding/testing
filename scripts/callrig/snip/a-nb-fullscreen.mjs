import { VIS } from './a-nb-lib.mjs';
const READ = async (page) => { await page.mouse.move(700,500); await page.waitForTimeout(500);
  return await page.evaluate((v)=>{ const vis=eval(v);
    return {fs: !!document.fullscreenElement,
      fsTag: document.fullscreenElement ? document.fullscreenElement.tagName.toLowerCase()+'#'+(document.fullscreenElement.getAttribute('data-testid')||'') : null,
      win: innerWidth+'x'+innerHeight,
      btns:[...document.querySelectorAll('button')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean),
      tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].filter(vis).length,
      panel: (()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
        return p && vis(p) ? (p.innerText||'').replace(/\s+/g,' ').slice(0,60) : null;})()};}, VIS); };
export default async ({page}) => {
  const out={};
  out.before = await READ(page);
  await page.locator('button[aria-label="Enter fullscreen"]').first().click();
  await page.waitForTimeout(3000);
  out.inFs = await READ(page);
  // can we still open the participants panel while fullscreen?
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count()) { await t.click(); await page.waitForTimeout(2500); }
  out.fsPanel = await READ(page);
  await page.keyboard.press('Escape'); await page.waitForTimeout(3000);
  out.afterEsc = await READ(page);
  return out;
};

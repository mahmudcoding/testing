/* Join, then read what the IN-CALL microphone menu shows for an account with no
   stored device preference. Control for the lobby finding only — in-call is sector L. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  out.screen0 = await page.evaluate(() => document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other');
  if (out.screen0 === 'lobby') {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
    await page.locator('[data-testid="lobby-join"]').click();
    await page.waitForTimeout(12000);
  }
  out.screen1 = await page.evaluate(() => document.querySelector('[data-testid="call-overlay-expanded"]') ? 'in-call' : 'other');
  out.published = await page.evaluate(() => {
    const rows = [];
    for (const pc of (window.__pcs||[])) { try { for (const s of pc.getSenders()) if (s.track) rows.push({k:s.track.kind,l:s.track.label}); } catch {} }
    return rows;
  });
  out.menu = await page.evaluate(async () => {
    const q = window.__qa;
    const b = [...document.querySelectorAll('button')].filter(e=>q.vis(e))
      .find(e => /^Select microphone$/i.test((e.getAttribute('aria-label')||'').trim()));
    if (!b) return { ok:false, why:'no Select microphone button' };
    b.click();
    await new Promise(r => setTimeout(r, 2000));
    const panels = [...document.querySelectorAll('[role=menu],[role=dialog],[role=listbox],[data-radix-popper-content-wrapper]')]
      .filter(e => q.boxVis(e));
    return { ok:true, panels: panels.map(p => ({
      role: p.getAttribute('role'),
      text: p.innerText.replace(/\n{2,}/g,'\n').slice(0,400),
      items: [...p.querySelectorAll('[role=menuitemradio],[role=option],[role=menuitem],button')].filter(e=>q.vis(e))
        .map(e=>({ t:(e.textContent||'').trim().slice(0,40), role:e.getAttribute('role'),
                   checked:e.getAttribute('aria-checked'), sel:e.getAttribute('aria-selected') })) })) };
  });
  return out;
};

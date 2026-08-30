/* In the lobby: open Settings, pick a NON-default microphone, prove the picker took it,
   then Join and read which device the call actually publishes. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const want = process.env.K30_MIC || 'Fake Audio Input 2';
  const out = { want };
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.screen0 = await page.evaluate(() => document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other');
  if (out.screen0 !== 'lobby') return out;

  // open lobby Settings
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-testid="lobby-device-bar"] button')]
      .find(e => /^Settings$/i.test((e.getAttribute('aria-label')||e.textContent||'').trim()));
    b && b.click();
  });
  await page.waitForTimeout(1800);

  // open the microphone combobox
  out.micComboBefore = await page.evaluate(() => {
    const c = [...document.querySelectorAll('[role=combobox]')].find(e => /Select microphone/i.test(e.getAttribute('aria-label')||''));
    return c ? { text: c.innerText.trim().slice(0,60), expanded: c.getAttribute('aria-expanded') } : null;
  });
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('[role=combobox]')].find(e => /Select microphone/i.test(e.getAttribute('aria-label')||''));
    c && c.click();
  });
  await page.waitForTimeout(1500);
  out.options = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('[role=option],[role=menuitemradio],[role=menuitem]')].filter(e=>q.vis(e))
      .map(e => ({ t: e.textContent.trim().slice(0,50), sel: e.getAttribute('aria-selected'), checked: e.getAttribute('aria-checked'), dstate: e.getAttribute('data-state') }));
  });
  const picked = await page.evaluate((w) => {
    const q = window.__qa;
    const o = [...document.querySelectorAll('[role=option],[role=menuitemradio],[role=menuitem]')].filter(e=>q.vis(e))
      .find(e => e.textContent.trim() === w);
    if (!o) return { ok:false };
    o.click(); return { ok:true, t:o.textContent.trim() };
  }, want);
  out.picked = picked;
  await page.waitForTimeout(2000);
  out.micComboAfter = await page.evaluate(() => {
    const c = [...document.querySelectorAll('[role=combobox]')].find(e => /Select microphone/i.test(e.getAttribute('aria-label')||''));
    return c ? { text: c.innerText.trim().slice(0,60) } : null;
  });
  // close the settings popover
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  out.gumBeforeJoin = await page.evaluate(() => (window.__gumCalls||[]).map(c => JSON.stringify(c).slice(0,200)));
  return out;
};

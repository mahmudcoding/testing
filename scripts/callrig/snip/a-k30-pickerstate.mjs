/* What do the lobby device pickers display, and what is actually in use?
   Reads each combobox's visible text, every option's selected state, and the
   live track label from the lobby preview stream. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = {};
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.screen = await page.evaluate(() => document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other');
  if (out.screen !== 'lobby') { out.url = page.url(); return out; }

  out.micButtonState = await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-testid="lobby-device-bar"] button')]
      .find(e => /Microphone/i.test(e.getAttribute('aria-label')||''));
    return b ? { l: b.getAttribute('aria-label'), dstate: b.getAttribute('data-state') } : null;
  });
  // what device is the lobby preview actually sampling? open our own stream on the
  // SAME constraints the app would use by default, and read the app's gum calls.
  out.gumCalls = await page.evaluate(() => (window.__gumCalls||[]).map(c => JSON.stringify(c).slice(0,220)));

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-testid="lobby-device-bar"] button')]
      .find(e => /^Settings$/i.test((e.getAttribute('aria-label')||e.textContent||'').trim()));
    b && b.click();
  });
  await page.waitForTimeout(2000);
  out.combos = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('[role=combobox]')].filter(e=>q.vis(e))
      .map(e => ({ aria: e.getAttribute('aria-label'), shows: e.innerText.trim().slice(0,50) }));
  });
  // open the mic list and read what is marked selected
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('[role=combobox]')].find(e => /Select microphone/i.test(e.getAttribute('aria-label')||''));
    c && c.click();
  });
  await page.waitForTimeout(1400);
  out.micOptions = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('[role=option]')].filter(e=>q.vis(e))
      .map(e => ({ t: e.textContent.trim().slice(0,45), sel: e.getAttribute('aria-selected'),
                   checked: e.getAttribute('aria-checked'), dstate: e.getAttribute('data-state') }));
  });
  return out;
};

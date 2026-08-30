/* Scope to the lobby device bar; inspect the Microphone row's contents; open the
   lobby's own Settings (not the sidebar's). */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  out.deviceBar = await page.evaluate(() => {
    const q = window.__qa;
    const bar = document.querySelector('[data-testid="lobby-device-bar"]');
    if (!bar) return null;
    return { text: bar.innerText.replace(/\n/g,' | '),
             buttons: [...bar.querySelectorAll('button')].filter(e=>q.vis(e))
               .map(e=>({ tid:e.getAttribute('data-testid'),
                          l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),
                          dstate: e.getAttribute('data-state'), expanded: e.getAttribute('aria-expanded'),
                          rect: (r=>({w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)}))(e.getBoundingClientRect()) })) };
  });
  // the Microphone check row in detail — what is actually inside it
  out.micRow = await page.evaluate(() => {
    const q = window.__qa;
    const rows = [...document.querySelectorAll('[data-testid="lobby-check-row"]')];
    const r = rows.find(e => /Microphone/.test(e.innerText));
    if (!r) return null;
    const meter = document.querySelector('[data-testid="lobby-audio-meter"]');
    return {
      html: r.outerHTML.slice(0, 900),
      innerText: r.innerText,
      meterPresent: !!meter,
      meterVis: meter ? q.boxVis(meter) : null,
      meterRect: meter ? (b=>({w:Math.round(b.width),h:Math.round(b.height)}))(meter.getBoundingClientRect()) : null,
      meterHtml: meter ? meter.outerHTML.slice(0, 600) : null,
    };
  });
  return out;
};

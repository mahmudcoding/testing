/* Press "Request to join again" on the declined screen and prove whether a request
   actually leaves. Captures API traffic and polls the screen from before the click. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { api: [], samples: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\/.*meeting/i.test(u)) return;
    let b = null; try { b = (await r.text()).slice(0, 300); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(), res: b });
  });
  await page.evaluate(DOM);
  const snap = () => page.evaluate(() => {
    const q = window.__qa;
    return { screen: document.querySelector('[data-testid="call-deep-link-waiting-room"]') ? 'waiting'
                   : document.querySelector('[data-testid="lobby-page"]') ? 'lobby'
                   : document.querySelector('[data-testid="call-overlay-expanded"]') ? 'in-call' : 'other',
             controls: [...document.querySelectorAll('button')].filter(e=>q.vis(e))
               .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim()).filter(Boolean),
             tail: document.body.innerText.replace(/\n{2,}/g,'\n').slice(-200) };
  });
  const t0 = Date.now();
  out.before = { t: 0, ...(await snap()) };
  const before = seen.length;
  const c = await page.evaluate(() => window.__qa.clickDeepest(/^Request to join again$/));
  out.click = c.ok ? c.name : c.why;
  for (let i = 0; i < 25; i++) { out.samples.push({ t: Date.now()-t0, ...(await snap()) }); await page.waitForTimeout(350); }
  out.apiAfterClick = seen.slice(before);
  out.transitions = out.samples.filter((s,i)=> i===0 || s.screen!==out.samples[i-1].screen
    || JSON.stringify(s.controls)!==JSON.stringify(out.samples[i-1].controls));
  delete out.samples;
  return out;
};

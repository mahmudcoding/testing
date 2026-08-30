/* Driven on the waiting person. Polls from before the host presses Admit. */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { };
  await page.evaluate(DOM);
  const snap = () => page.evaluate(() => {
    const q = window.__qa;
    return { screen: document.querySelector('[data-testid="call-deep-link-waiting-room"]') ? 'waiting'
                   : document.querySelector('[data-testid="lobby-page"]') ? 'lobby'
                   : document.querySelector('[data-testid="call-overlay-expanded"]') ? 'in-call' : 'other',
             controls: [...document.querySelectorAll('button')].filter(e=>q.vis(e))
               .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim()).filter(Boolean).slice(0,14) };
  });
  const samples = [];
  const t0 = Date.now();
  samples.push({ t: 0, ...(await snap()) });
  const hb = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('A','alice')}`);
  const hp = hb.contexts()[0].pages().filter(p=>p.url().includes('airion-cargo.store'))[0];
  await hp.evaluate(DOM);
  out.admit = await hp.evaluate(() => {
    const q = window.__qa;
    const b = [...document.querySelectorAll('button')].filter(e=>q.vis(e))
      .find(e => /^Admit /.test(e.getAttribute('aria-label')||''));
    if (!b) return { ok:false, seen:[...document.querySelectorAll('button')].map(e=>e.getAttribute('aria-label')).filter(Boolean).slice(0,25) };
    b.click(); return { ok:true, l:b.getAttribute('aria-label') };
  });
  for (let i=0;i<40;i++){ samples.push({ t: Date.now()-t0, ...(await snap()) }); await page.waitForTimeout(350); }
  await hb.close().catch(()=>{});
  out.transitions = samples.filter((s,i)=> i===0 || s.screen!==samples[i-1].screen);
  out.enteredAt = (samples.find(s=>s.screen==='in-call')||{}).t ?? null;
  out.finalScreen = samples[samples.length-1].screen;
  return out;
};

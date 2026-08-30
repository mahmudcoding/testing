/* Driven on the WAITING person. Polls their screen from before the trigger, reaches
   the host's browser over CDP and presses Deny, then keeps polling.
   Records the maximum-opacity notice over its lifetime, keyed on text+size. */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM } from './lib.mjs';

export default async ({ page }) => {
  const out = { samples: [] };
  await page.evaluate(DOM);

  const snap = () => page.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e => q.vis(e));
    const notices = [...document.querySelectorAll('[data-sonner-toast],[role=alert],[role=status]')]
      .map(e => { const r = e.getBoundingClientRect();
        return { t: e.innerText.trim().slice(0,70), w: Math.round(r.width), h: Math.round(r.height),
                 vis: q.boxVis(e) }; })
      .filter(n => n.t && n.vis && n.w > 1 && n.h > 1);
    return {
      url: location.pathname,
      screen: document.querySelector('[data-testid="call-deep-link-waiting-room"]') ? 'waiting'
            : document.querySelector('[data-testid="lobby-page"]') ? 'lobby'
            : document.querySelector('[data-testid="call-overlay-expanded"]') ? 'in-call'
            : document.querySelector('[data-testid="call-password-gate"]') ? 'password' : 'other',
      docText: document.body.innerText.replace(/\n{2,}/g,'\n').slice(-320),
      controls: [...document.querySelectorAll('button,a[href]')].filter(e=>q.vis(e))
        .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim()).filter(Boolean),
      notices: [...new Set(notices.map(n=>`${n.t}|${n.w}x${n.h}`))],
    };
  });

  const t0 = Date.now();
  const push = async (tag) => out.samples.push({ t: Date.now()-t0, tag, ...(await snap()) });
  await push('pre');
  await push('pre');

  // reach the host and press Deny
  const hostBrowser = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('A','alice')}`);
  const hctx = hostBrowser.contexts()[0];
  const hpage = hctx.pages().filter(p => p.url().includes('airion-cargo.store'))[0];
  out.hostUrl = hpage ? hpage.url() : null;
  await hpage.evaluate(DOM);
  const denied = await hpage.evaluate(() => {
    const q = window.__qa;
    const b = [...document.querySelectorAll('button')].filter(e=>q.vis(e))
      .find(e => /^Deny /.test(e.getAttribute('aria-label')||''));
    if (!b) return { ok:false, seen: [...document.querySelectorAll('button')].map(e=>e.getAttribute('aria-label')).filter(Boolean).slice(0,20) };
    b.click(); return { ok:true, l: b.getAttribute('aria-label') };
  });
  out.denied = denied;

  for (let i = 0; i < 40; i++) { await push('post'); await page.waitForTimeout(350); }
  await hostBrowser.close().catch(()=>{});

  out.transitions = out.samples.filter((s,i) => i===0 || s.screen !== out.samples[i-1].screen
    || JSON.stringify(s.notices) !== JSON.stringify(out.samples[i-1].notices)
    || JSON.stringify(s.controls) !== JSON.stringify(out.samples[i-1].controls));
  out.allNoticesSeen = [...new Set(out.samples.flatMap(s=>s.notices))];
  out.sampleCount = out.samples.length;
  delete out.samples;
  return out;
};

/* Alice rings Bob 1-to-1 from the DM. Captures the caller's outgoing surface and,
   over CDP, the callee's incoming surface — polled from before the call starts. */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM } from './lib.mjs';

export default async ({ page }) => {
  const ws = 'W4QAF1XTURESO01';
  const out = { api: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\/.*meeting/i.test(u) || r.request().method()==='GET') return;
    let b=null; try { b=(await r.text()).slice(0,400); } catch {}
    seen.push({ m:r.request().method(), u:u.replace(/^https?:\/\/[^/]+/,''), s:r.status(),
                req:(r.request().postData()||'').slice(0,250), res:b });
  });

  // clean slate
  await page.evaluate(async (w) => {
    const r = await fetch(`/api/v1/workspace/${w}/meetings/active`, { credentials:'include' });
    const j = await r.json().catch(()=>({}));
    for (const m of (j.meetings||[])) await fetch(`/api/v1/meeting/${m.id}/end`, {method:'POST',credentials:'include'});
  }, ws);
  await page.waitForTimeout(2500);

  // callee poller, set up BEFORE the call
  const bb = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('A','bob')}`);
  const bp = bb.contexts()[0].pages().filter(p=>p.url().includes('airion-cargo.store'))[0];
  await bp.goto(`https://airion-cargo.store/w/${ws}/chat/saved`, { waitUntil:'domcontentloaded' });
  await bp.waitForTimeout(4000);
  await bp.evaluate(DOM);
  const bsnap = () => bp.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e=>q.vis(e));
    return { vs: document.visibilityState, url: location.pathname,
             incoming: [...new Set(vis.filter(e=>/incoming|calling|is calling|ringing/i.test(e.textContent||''))
               .map(e=>({len:(e.textContent||'').length, t:(e.textContent||'').trim().slice(0,70)}))
               .sort((a,b)=>a.len-b.len).slice(0,2).map(o=>o.t))],
             controls: [...document.querySelectorAll('button')].filter(e=>q.vis(e))
               .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim())
               .filter(t=>/accept|decline|answer|reject|join|ignore/i.test(t)),
             testids: [...new Set(vis.map(e=>e.getAttribute('data-testid')).filter(t=>t&&/incoming|call/i.test(t)))] };
  });

  // start the call from the DM
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`, { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(2500);
  const dm = page.locator('nav :text("QA Bob"), aside :text("QA Bob")').first();
  if (await dm.count()) { await dm.click(); await page.waitForTimeout(3000); }
  await page.evaluate(DOM);
  out.callerControls = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('button')].filter(e=>q.vis(e))
      .map(e=>({tid:e.getAttribute('data-testid'), l:(e.getAttribute('aria-label')||'').trim()}))
      .filter(x=>/call/i.test(x.l)||/call/i.test(x.tid||''));
  });

  const samples = []; const t0 = Date.now();
  samples.push({ t:0, tag:'pre', ...(await bsnap()) });
  const cb = page.locator('button[aria-label*="call" i]').first();
  await cb.click();
  await page.waitForTimeout(1500);
  for (let i=0;i<16;i++){ samples.push({ t: Date.now()-t0, tag:'post', ...(await bsnap()) }); await bp.waitForTimeout(500); }

  out.callerSurface = await page.evaluate(() => {
    const q = window.__qa;
    return { url: location.pathname,
             text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(-350),
             controls: [...document.querySelectorAll('button')].filter(e=>q.vis(e))
               .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim()).filter(Boolean).slice(0,16) };
  });
  out.api = seen;
  out.calleeTransitions = samples.filter((s,i)=> i===0 || JSON.stringify(s.controls)!==JSON.stringify(samples[i-1].controls)
    || JSON.stringify(s.incoming)!==JSON.stringify(samples[i-1].incoming));
  out.density = `${samples.length} samples over ${samples[samples.length-1].t}ms (nominal 500ms)`;
  await bb.close().catch(()=>{});
  return out;
};

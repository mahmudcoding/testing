/* Alice rings Bob from the DM. Callee polled from BEFORE the click, over CDP.
   Reports poller density so the timing claim can be checked. */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM } from './lib.mjs';

export default async ({ page }) => {
  const ws = 'W4QAF1XTURESO01';
  const dm = process.env.K30_DM;
  const out = { api: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\/.*meeting/i.test(u) || r.request().method()==='GET') return;
    let b=null; try { b=(await r.text()).slice(0,420); } catch {}
    seen.push({ m:r.request().method(), u:u.replace(/^https?:\/\/[^/]+/,''), s:r.status(),
                req:(r.request().postData()||'').slice(0,250), res:b });
  });

  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`, { waitUntil:'commit', timeout:90000 });
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);
  out.dmControls = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('button,[role=button]')].filter(e=>q.vis(e))
      .map(e=>({ tid:e.getAttribute('data-testid'), l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,35) }))
      .filter(x => /call|video|phone/i.test((x.l||'')+(x.tid||'')));
  });

  // callee poller ready before the ring
  const bb = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('A','bob')}`);
  const bp = bb.contexts()[0].pages().filter(p=>p.url().includes('airion-cargo.store'))[0];
  await bp.goto(`https://airion-cargo.store/w/${ws}/chat/saved`, { waitUntil:'commit', timeout:90000 });
  await bp.waitForTimeout(6000);
  await bp.evaluate(DOM);
  const bsnap = () => bp.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e=>q.vis(e));
    const acts = [...document.querySelectorAll('button')].filter(e=>q.vis(e))
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim())
      .filter(t=>/accept|decline|answer|reject|ignore|join call/i.test(t));
    const banner = [...new Set(vis.filter(e=>/calling|incoming/i.test(e.textContent||''))
      .map(e=>({len:(e.textContent||'').length,t:(e.textContent||'').trim()}))
      .sort((a,b)=>a.len-b.len).slice(0,1).map(o=>o.t.slice(0,90)))];
    return { vs: document.visibilityState, acts, banner,
             tids: [...new Set(vis.map(e=>e.getAttribute('data-testid')).filter(t=>t&&/incoming|ring|call/i.test(t)))] };
  });

  const samples = []; const t0 = Date.now();
  samples.push({ t:0, tag:'pre', ...(await bsnap()) });

  const clicked = await page.evaluate(() => {
    const q = window.__qa;
    const b = [...document.querySelectorAll('button')].filter(e=>q.vis(e))
      .find(e => /start call|call$|^call/i.test((e.getAttribute('aria-label')||e.textContent||'').trim()));
    if (!b) return { ok:false, seen:[...document.querySelectorAll('button')].map(e=>(e.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,25) };
    b.click(); return { ok:true, l:(b.getAttribute('aria-label')||b.textContent||'').trim() };
  });
  out.clicked = clicked;
  for (let i=0;i<20;i++){ samples.push({ t: Date.now()-t0, tag:'post', ...(await bsnap()) }); await bp.waitForTimeout(500); }

  out.api = seen;
  out.callerAfter = await page.evaluate(() => {
    const q = window.__qa;
    return { url: location.pathname,
             text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(-280),
             controls: [...document.querySelectorAll('button')].filter(e=>q.vis(e))
               .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim()).filter(Boolean).slice(-8) };
  });
  out.calleeTransitions = samples.filter((s,i)=> i===0 || JSON.stringify(s.acts)!==JSON.stringify(samples[i-1].acts)
    || JSON.stringify(s.banner)!==JSON.stringify(samples[i-1].banner));
  out.density = `${samples.length} samples / ${samples[samples.length-1].t}ms (nominal 500ms → expected ${(samples.length-1)*500}ms)`;
  await bb.close().catch(()=>{});
  return out;
};

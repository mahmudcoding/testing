/* A fresh guest lands on the invite link of a call that is CURRENTLY RECORDING.
   Same three instruments as the member lobby, each with a positive control. */
import { DOM } from './lib.mjs';
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const name = process.env.K30_GNAME || 'Guest Rec';
  const out = {};
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(8000);
  await gp.evaluate(DOM);

  const probe = () => gp.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e => q.vis(e));
    const doc = document.body.innerText || '';
    return {
      byText: vis.filter(e => /record/i.test(e.textContent||''))
        .map(e => ({ tag:e.tagName, tid:e.getAttribute('data-testid'), len:(e.textContent||'').length }))
        .sort((a,b)=>a.len-b.len).slice(0,4),
      byAttr: vis.filter(e => /record|consent/i.test((e.getAttribute('data-testid')||'')+(e.getAttribute('aria-label')||'')+(e.getAttribute('title')||'')))
        .map(e=>({ tag:e.tagName, tid:e.getAttribute('data-testid') })),
      docLen: doc.length, docHasRecord: /record/i.test(doc), docHasConsent: /consent|acknowledg/i.test(doc),
      docText: doc.replace(/\n{2,}/g,'\n').slice(0,300),
      checkboxes: [...document.querySelectorAll('input[type=checkbox],[role=checkbox]')].length,
      // positive controls for the same three instruments
      ctrlByText: vis.filter(e => /invited/i.test(e.textContent||'')).length,
      ctrlDocHas: /invited/i.test(doc),
    };
  });
  out.landing = await probe();

  // what can the guest read about the call?
  out.guestApi = await gp.evaluate(async () => {
    const tok = location.pathname.split('/').pop();
    const paths = ['/api/v1/auth/me', `/api/v1/guest/meeting/${tok}`, `/api/v1/join/${tok}`];
    const r = {};
    for (const p of paths) { try { const res = await fetch(p, {credentials:'include'}); r[p] = { s: res.status, b: (await res.text()).slice(0,300) }; } catch(e){ r[p]={err:String(e)}; } }
    return r;
  });

  // join and see whether the guest is told once inside
  await gp.locator('input[type=text]').first().fill(name);
  await gp.waitForTimeout(600);
  const samples = []; const t0 = Date.now();
  await gp.locator('button[type=submit]').first().click();
  for (let i=0;i<40;i++){
    samples.push({ t: Date.now()-t0, ...(await gp.evaluate(() => {
      const q = window.__qa;
      const vis = [...document.querySelectorAll('*')].filter(e=>q.vis(e));
      return { inCall: !!document.querySelector('[data-testid="guest-call-surface"]'),
               recBadge: !!document.querySelector('[data-testid="call-recording-badge"]'),
               recText: [...new Set(vis.filter(e=>e.children.length===0 && /record/i.test(e.textContent||''))
                 .map(e=>e.textContent.trim()))] };
    })) });
    await gp.waitForTimeout(400);
  }
  out.firstRecSignal = samples.find(s => s.recBadge || s.recText.length) || null;
  out.enteredAt = (samples.find(s=>s.inCall)||{}).t ?? null;
  out.finalSample = samples[samples.length-1];
  await gctx.close();
  return out;
};

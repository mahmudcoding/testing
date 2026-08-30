/* Second reproduction, open + recording call: preview response in full, landing in full,
   then the join walk polled from before the click. */
import { DOM } from './lib.mjs';
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const out = {};
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  const prev = [];
  gp.on('response', async (r) => {
    if (!/\/api\/guest\/preview/.test(r.url())) return;
    let b=null; try { b=await r.text(); } catch {}
    prev.push({ s: r.status(), bodyFull: b });
  });
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(9000);
  await gp.evaluate(DOM);
  out.preview = prev;
  out.landing = await gp.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e=>q.vis(e));
    const doc = document.body.innerText || '';
    return { docTextFull: doc.replace(/\n{2,}/g,'\n'), docLen: doc.length,
             mentionsRecording: /record/i.test(doc),
             byAttrRecordOrConsent: vis.filter(e=>/record|consent/i.test((e.getAttribute('data-testid')||'')+(e.getAttribute('aria-label')||''))).length,
             checkboxes: document.querySelectorAll('input[type=checkbox],[role=checkbox]').length,
             ctrl_invited: /invited/i.test(doc) };
  });

  const snap = () => gp.evaluate(() => ({
    inCall: !!document.querySelector('[data-testid="guest-call-surface"]'),
    badge: !!document.querySelector('[data-testid="call-recording-badge"]'),
    recText: /record/i.test(document.body.innerText||''),
  }));
  await gp.locator('input[type=text]').first().fill('Guest Two');
  await gp.waitForTimeout(700);
  const samples = []; const t0 = Date.now();
  samples.push({ t: 0, tag:'pre', ...(await snap()) });
  await gp.locator('button[type=submit]').first().click();
  for (let i=0;i<40;i++){ samples.push({ t: Date.now()-t0, tag:'post', ...(await snap()) }); await gp.waitForTimeout(400); }
  out.enteredAt = (samples.find(s=>s.inCall)||{}).t ?? null;
  out.firstRecAt = (samples.find(s=>s.badge||s.recText)||{}).t ?? null;
  out.sampleCount = samples.length;
  out.durMs = samples[samples.length-1].t;
  out.density = `${samples.length} samples over ${samples[samples.length-1].t}ms (nominal 400ms)`;
  await gctx.close();
  return out;
};

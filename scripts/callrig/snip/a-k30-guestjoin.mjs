/* Full guest arrival: fresh context, name, Join, poll through to whatever screen follows. */
import { DOM } from './lib.mjs';
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const name = process.env.K30_GNAME || 'Guest Kilo';
  const out = { name };
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  const seen = [];
  gp.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u)) return;
    let b = null; try { b = (await r.text()).slice(0, 350); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(), res: b });
  });
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(7000);
  await gp.evaluate(DOM);

  out.beforeName = await gp.evaluate(() => {
    const b = [...document.querySelectorAll('button[type=submit]')][0];
    return { submitDisabled: b ? b.disabled : null, text: document.body.innerText.slice(0,200) };
  });
  await gp.locator('input[type=text]').first().fill(name);
  await gp.waitForTimeout(700);
  out.afterName = await gp.evaluate(() => {
    const b = [...document.querySelectorAll('button[type=submit]')][0];
    return { submitDisabled: b ? b.disabled : null };
  });

  const snap = () => gp.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e => q.vis(e));
    return { url: location.pathname,
             text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0, 400),
             controls: [...document.querySelectorAll('button,input')].filter(e=>q.vis(e))
               .map(e=>(e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.textContent||'').trim()).filter(Boolean).slice(0,18),
             testids: [...new Set(vis.map(e=>e.getAttribute('data-testid')).filter(Boolean))].slice(0,25),
             rec: /record/i.test(document.body.innerText) };
  });
  const samples = []; const t0 = Date.now();
  samples.push({ t:0, tag:'pre', ...(await snap()) });
  await gp.locator('button[type=submit]').first().click();
  for (let i=0;i<45;i++){ samples.push({ t: Date.now()-t0, tag:'post', ...(await snap()) }); await gp.waitForTimeout(400); }
  out.transitions = samples.filter((s,i)=> i===0 || s.url!==samples[i-1].url
    || JSON.stringify(s.testids)!==JSON.stringify(samples[i-1].testids));
  out.finalText = samples[samples.length-1].text;
  out.finalControls = samples[samples.length-1].controls;
  out.everRecording = samples.some(s=>s.rec);
  out.api = seen.filter(r=>/meeting|guest|join/i.test(r.u));
  out.keptOpen = true;
  // leave the context open so the guest stays in the call for the host-side check
  globalThis.__k30guest = gctx;
  return out;
};

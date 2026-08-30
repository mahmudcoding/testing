/* Open a guest link in a FRESH unauthenticated browser context (separate cookie jar,
   same browser process — no extra window against the lane cap). Describe the landing. */
import { DOM } from './lib.mjs';
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const out = { link: link ? link.slice(0, 60) + '…' : null };
  if (!link) { out.abort = 'no K30_LINK'; return out; }

  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  out.ctxCreated = true;
  const seen = [];
  gp.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u)) return;
    let b = null; try { b = (await r.text()).slice(0, 400); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(), res: b });
  });
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(8000);
  await gp.evaluate(DOM);
  out.url = gp.url();
  out.authed = await gp.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', { credentials: 'include' });
    return { s: r.status, b: (await r.text()).slice(0, 120) };
  });
  out.landing = await gp.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e => q.vis(e));
    return {
      docText: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0, 700),
      controls: [...document.querySelectorAll('button,a[href],input,[role=button]')].filter(e=>q.vis(e))
        .map(e=>({ tag:e.tagName, tid:e.getAttribute('data-testid'), type:e.getAttribute('type'),
                   l:(e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.textContent||'').trim().slice(0,45),
                   dis:e.disabled===true||e.getAttribute('aria-disabled')==='true' })),
      testids: [...new Set(vis.map(e=>e.getAttribute('data-testid')).filter(Boolean))],
      recordingMention: /record/i.test(document.body.innerText),
    };
  });
  out.api = seen.filter(r => !/notifications|presence|unread/.test(r.u));
  // keep the context for follow-ups within this run only
  await gctx.close();
  return out;
};

/* Does the guest invite link enforce the call password? Fresh unauthenticated context.
   Enumerates the landing completely, then attempts the join and reports the outcome. */
import { DOM } from './lib.mjs';
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const name = process.env.K30_GNAME || 'Guest PW';
  const out = {};
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  const seen = [];
  gp.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u)) return;
    let b=null; try { b=(await r.text()).slice(0,350); } catch {}
    seen.push({ m:r.request().method(), u:u.replace(/^https?:\/\/[^/]+/,''), s:r.status(),
                req:(r.request().postData()||'').slice(0,200), res:b });
  });
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(8000);
  await gp.evaluate(DOM);

  out.landing = await gp.evaluate(() => {
    const q = window.__qa;
    return {
      docText: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,500),
      controls: [...document.querySelectorAll('button,input,a[href]')].filter(e=>q.vis(e))
        .map(e=>({ tag:e.tagName, type:e.getAttribute('type'),
                   l:(e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.textContent||'').trim().slice(0,45),
                   dis:e.disabled===true })),
      passwordInputs: [...document.querySelectorAll('input[type=password]')].map(e=>({vis:q.vis(e)})),
      mentionsPassword: /password/i.test(document.body.innerText),
    };
  });

  await gp.locator('input[type=text]').first().fill(name);
  await gp.waitForTimeout(600);
  const before = seen.length;
  await gp.locator('button[type=submit]').first().click();
  await gp.waitForTimeout(10000);
  out.afterJoin = await gp.evaluate(() => {
    const q = window.__qa;
    return { url: location.pathname,
             inCall: !!document.querySelector('[data-testid="guest-call-surface"]'),
             passwordGate: !!document.querySelector('[data-testid="call-password-gate"]'),
             passwordInputs: [...document.querySelectorAll('input[type=password]')].filter(e=>q.vis(e)).length,
             docText: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,400) };
  });
  out.api = seen.slice(before).filter(r => /meeting|join|guest/i.test(r.u));
  await gctx.close();
  return out;
};

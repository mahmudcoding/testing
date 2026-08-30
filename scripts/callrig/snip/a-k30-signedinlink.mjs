/* What does a SIGNED-IN member see when they open a guest link? */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const link = process.env.K30_LINK;
  const out = {};
  const prev = [];
  page.on('response', async (r) => {
    if (!/\/api\/guest\/preview/.test(r.url())) return;
    let b=null; try { b=await r.text(); } catch {}
    prev.push({ s:r.status(), body:b });
  });
  await page.goto(link, { waitUntil:'commit', timeout:90000 });
  await page.waitForTimeout(10000);
  await page.evaluate(DOM);
  out.preview = prev;
  out.state = await page.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e=>q.vis(e));
    const doc = document.body.innerText||'';
    return { url: location.pathname,
             docText: doc.replace(/\n{2,}/g,'\n').slice(0,400),
             docLen: doc.length,
             mentionsRecording: /record/i.test(doc),
             byAttrRecord: vis.filter(e=>/record|consent/i.test((e.getAttribute('data-testid')||'')+(e.getAttribute('aria-label')||''))).length,
             fields: [...document.querySelectorAll('input')].filter(e=>q.vis(e)).map(e=>e.getAttribute('type')),
             buttons: [...document.querySelectorAll('button')].filter(e=>q.vis(e))
               .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim()).filter(Boolean).slice(0,10),
             ctrl_invited: /invited/i.test(doc) };
  });
  return out;
};

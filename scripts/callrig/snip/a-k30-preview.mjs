/* Read the guest pre-join preview response IN FULL plus the landing page it produces.
   Control: does the page render every field the preview carries? */
import { DOM } from './lib.mjs';
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const out = {};
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  const seen = [];
  gp.on('response', async (r) => {
    if (!/\/api\/guest\/preview/.test(r.url())) return;
    let b=null; try { b=await r.text(); } catch {}
    seen.push({ u: r.url().replace(/^https?:\/\/[^/]+/,''), s: r.status(),
                req: r.request().postData(), bodyFull: b });
  });
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(9000);
  await gp.evaluate(DOM);
  out.preview = seen;
  out.previewKeys = seen.length ? Object.keys(JSON.parse(seen[0].bodyFull || '{}')) : null;
  out.landing = await gp.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e=>q.vis(e));
    const doc = document.body.innerText || '';
    return {
      docTextFull: doc.replace(/\n{2,}/g,'\n'),
      docLen: doc.length,
      fields: [...document.querySelectorAll('input')].filter(e=>q.vis(e))
        .map(e=>({type:e.getAttribute('type'), ph:e.getAttribute('placeholder')})),
      mentionsApproval: /approv|admit|wait/i.test(doc),
      mentionsPassword: /password/i.test(doc),
      mentionsRecording: /record/i.test(doc),
      byAttrRecord: vis.filter(e=>/record|consent/i.test((e.getAttribute('data-testid')||'')+(e.getAttribute('aria-label')||''))).length,
      ctrl_invited: /invited/i.test(doc),
    };
  });
  await gctx.close();
  return out;
};

/* Capture the COMPLETE request set of the guest landing page (all hosts, all paths),
   with full bodies for anything that returns meeting metadata. */
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const out = {};
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  const seen = [];
  gp.on('response', async (r) => {
    const u = r.url();
    if (/\.(js|css|woff2?|png|svg|ico|jpg|map)(\?|$)/.test(u)) return;
    let b=null; try { b=await r.text(); } catch {}
    seen.push({ m:r.request().method(), u:u.replace(/^https?:\/\/[^/]+/,''), s:r.status(),
                len: b==null?null:b.length, body: b });
  });
  await gp.goto(link, { waitUntil: 'networkidle' }).catch(()=>{});
  await gp.waitForTimeout(9000);
  out.requests = seen.map(r => ({ m:r.m, u:r.u.slice(0,90), s:r.s, len:r.len }));
  // any response mentioning the call name or a recording field, in full
  out.metadataResponses = seen
    .filter(r => r.body && /QA K30|meeting|recording|password_protected/i.test(r.body) && r.len < 4000)
    .map(r => ({ u: r.u.slice(0,90), s: r.s, body: r.body.slice(0, 900) }));
  out.anyRecordingKey = seen.filter(r => r.body && /recording/i.test(r.body))
    .map(r => ({ u: r.u.slice(0,80), s: r.s, hit: (r.body.match(/.{0,60}recording.{0,60}/i)||[])[0] }));
  await gctx.close();
  return out;
};

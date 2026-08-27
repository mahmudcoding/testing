const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const all=[], posts=[];
  p.on('request', r => { all.push(`${r.method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,70)}`);
    if (r.method()!=='GET') posts.push({ m:r.method(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,70), body:(r.postData()||'').slice(0,120) }); });
  const resp=[];
  p.on('response', async r => { if(r.request().method()==='GET') return;
    let b=''; try{ b=(await r.text()).slice(0,200); }catch{}
    resp.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,60)} -> ${r.status()} ${b}`); });
  await p.goto('https://airion-cargo.store/forgot-password', { waitUntil:'networkidle' });
  await p.waitForTimeout(1600);
  const mark = all.length;
  await p.fill('input[name="email"]', 'qa.d.dave@aloqa.test');
  await p.waitForTimeout(300);
  await p.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button[type=submit]')].filter(vis); b[0].click(); })()`);
  await p.waitForTimeout(4500);
  const after = await p.evaluate(`(() => (document.body.innerText||'').replace(/\\s+/g,' ').slice(0,160))()`);
  const out = { requestsAfterSubmit: all.slice(mark), nonGet: posts, responses: resp, pageAfter: after };
  await ctx.close();
  return out;
};

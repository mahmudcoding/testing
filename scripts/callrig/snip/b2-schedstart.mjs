export default async ({ page }) => {
  const title = process.env.QA_TITLE || 'QA sched start';
  const net = [];
  page.on('response', async r => { if (/\/api\/v1\/(calendar\/meetings|meeting)/.test(r.url()) && r.request().method()!=='GET') {
    let b=''; try { b=(await r.text()).slice(0,150); } catch {}
    net.push({ st:r.status(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,52), body:b }); } });
  const hit = await page.evaluate(t => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const cand = [...document.querySelectorAll('*')].filter(v)
      .filter(e=>(e.innerText||'').includes(t) && (e.innerText||'').length < 400);
    let node = cand[cand.length-1];
    for (let i=0; i<8 && node; i++) {
      const b = [...node.querySelectorAll('button')].filter(v).find(x=>/^Start call$/i.test((x.innerText||'').trim()));
      if (b) { b.click(); return true; }
      node = node.parentElement; }
    return false; }, title);
  await page.waitForTimeout(8000);
  return { clicked: hit, net, after: await page.evaluate(() => ({
    url: location.pathname, surface: !!document.querySelector('[data-testid="call-surface"]'),
    id: (location.pathname.match(/\/call\/([A-Za-z0-9]+)/)||[])[1] || null })) };
};

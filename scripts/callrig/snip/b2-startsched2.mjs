export default async ({ page }) => {
  const net = [];
  page.on('response', async r => { if (/\/api\/v1\/(calendar\/meetings|meeting)/.test(r.url()) && r.request().method()!=='GET') {
    let b=''; try { b=(await r.text()).slice(0,140); } catch {}
    net.push({ st:r.status(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,50), body:b }); } });
  const hit = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const btns = [...document.querySelectorAll('button')].filter(v)
      .filter(b=>/^Start call$/i.test((b.innerText||'').trim()));
    for (const b of btns) {
      let n = b, h = 0;
      while (n && h < 5) { n = n.parentElement; h++;
        if (n && /\d{1,2}:\d\d (AM|PM)/.test(n.innerText||'') && /Start call/.test(n.innerText||'')) {
          b.click(); return n.innerText.replace(/\n+/g,' | ').slice(0,90); } }
    }
    return null; });
  await page.waitForTimeout(8000);
  return { clickedCard: hit, net, after: await page.evaluate(() => ({
    url: location.pathname, id: (location.pathname.match(/\/call\/([A-Za-z0-9]+)/)||[])[1] || null })) };
};

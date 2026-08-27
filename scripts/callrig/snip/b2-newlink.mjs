export default async ({ page }) => {
  await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-add-to-call"]'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const before = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    const inp = d && [...d.querySelectorAll('input')].filter(v).find(i=>/^https/.test(i.value||''));
    return inp ? inp.value : 'no link field'; });
  const net = [];
  page.on('response', async r => { if (/\/api\/v1\/meeting/.test(r.url()) && r.request().method()!=='GET') {
    let b=''; try { b=(await r.text()).slice(0,120); } catch {}
    net.push({ st:r.status(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,44), body:b }); } });
  const hit = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    const b = d && [...d.querySelectorAll('button')].filter(v).find(x=>/^Create new link$/i.test((x.innerText||'').trim()));
    if (!b) return false; b.click(); return true; });
  await page.waitForTimeout(5000);
  const after = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    const inp = d && [...d.querySelectorAll('input')].filter(v).find(i=>/^https/.test(i.value||''));
    return inp ? inp.value : 'no link field'; });
  return { linkBefore: before.slice(-12), clicked: hit, net, linkAfter: after.slice(-12),
           changed: before !== after };
};

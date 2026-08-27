export default async ({ page }) => {
  const tid = process.env.QA_TID;
  const net = [];
  page.on('response', async r => { if (/\/api\/v1\/meeting/.test(r.url()) && r.request().method() !== 'GET') {
    let b=''; try { b = (await r.text()).slice(0,220); } catch {}
    net.push({ st:r.status(), m:r.request().method(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,60), body:b }); } });
  const before = await page.evaluate(t => { const e=document.querySelector(`[data-testid="${t}"]`);
    return e ? (e.getAttribute('aria-checked')||e.getAttribute('data-state')) : 'NOT-FOUND'; }, tid);
  await page.evaluate(t => { const e=document.querySelector(`[data-testid="${t}"]`); if (e) e.click(); }, tid);
  await page.waitForTimeout(3500);
  const after = await page.evaluate(t => { const e=document.querySelector(`[data-testid="${t}"]`);
    return e ? (e.getAttribute('aria-checked')||e.getAttribute('data-state')) : 'NOT-FOUND'; }, tid);
  return { tid, before, after, net };
};

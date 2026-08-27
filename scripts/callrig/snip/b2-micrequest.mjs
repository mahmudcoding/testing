export default async ({ page }) => {
  const net = [];
  page.on('response', async r => { if (/\/api\/v1\//.test(r.url()) && r.request().method() !== 'GET') {
    let b=''; try { b=(await r.text()).slice(0,180); } catch {}
    net.push({ st:r.status(), m:r.request().method(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,70), body:b }); } });
  const read = () => page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/^(Mute|Unmute|Request|Ask)/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    return b ? { label:(b.getAttribute('aria-label')||b.textContent).trim().slice(0,30),
                 pressed:b.getAttribute('aria-pressed'), disabled:b.disabled, title:b.getAttribute('title') } : 'NOT-FOUND';
  });
  const before = await read();
  await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/^(Mute|Unmute|Request|Ask)/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    if (b) b.click(); });
  await page.waitForTimeout(5000);
  const after = await read();
  const toasts = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]')].filter(v)
      .map(t=>t.innerText.replace(/\n+/g,' | ').slice(0,110)).filter(Boolean); });
  return { before, after, toasts, net };
};

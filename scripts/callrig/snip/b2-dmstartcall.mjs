export default async ({ page }) => {
  const net = [];
  page.on('response', async r => { if (/\/api\/v1\/(meeting|messaging)/.test(r.url()) && r.request().method()!=='GET') {
    let b=''; try { b=(await r.text()).slice(0,150); } catch {}
    net.push({ st:r.status(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,40), body:b }); } });
  const before = await page.evaluate(() => location.pathname);
  const hit = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>(x.getAttribute('aria-label')||'')==='Start call');
    if (!b) return false; b.click(); return true; });
  await page.waitForTimeout(6000);
  return { before, clicked: hit, net,
    after: await page.evaluate(() => ({ url: location.pathname,
      overlay: (()=>{ const v=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
        const f=[...document.body.querySelectorAll('div,section')].filter(e=>{const c=getComputedStyle(e);
          return (c.position==='fixed') && v(e) && (e.innerText||'').trim().length>6 && (e.innerText||'').length<200;})
          .map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,90)); return [...new Set(f)].slice(0,3); })(),
      surface: !!document.querySelector('[data-testid="call-surface"]') })) };
};

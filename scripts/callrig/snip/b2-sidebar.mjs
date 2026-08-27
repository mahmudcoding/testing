export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const links = [...document.querySelectorAll('a')].filter(v)
      .map(a=>({ label:(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,26),
                 href:(a.getAttribute('href')||'').slice(-18) }))
      .filter(a=>/\/c\/|\/d\//.test(a.href));
    return { order: links.map(l=>l.label) };
  });
};

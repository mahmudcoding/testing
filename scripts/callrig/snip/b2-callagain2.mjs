export default async ({ page }) => {
  const ws='W4QBF1XTURESO01', id=process.env.QA_MEETING;
  await page.goto(`https://airion-cargo.store/w/${ws}/calls/${id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const controls = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return [...document.querySelectorAll('button,a')].filter(v)
      .map(b=>({ t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26),
                 al:(b.getAttribute('aria-label')||'').slice(0,26) }))
      .filter(b=>b.t||b.al).slice(-14);
  });
  const clicked = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button,a')].filter(v)
      .find(x=>/^Call again$/i.test((x.innerText||'').trim()));
    if (!b) return null; b.click(); return 'Call again';
  });
  await page.waitForTimeout(8000);
  return { controls, clicked, after: await page.evaluate(() => ({
    url: location.pathname,
    dialog: (()=>{ const d=[...document.querySelectorAll('[role="dialog"]')]
      .filter(e=>e.getBoundingClientRect().width>0).pop();
      return d ? d.innerText.replace(/\n+/g,' | ').slice(0,300) : null; })(),
    newId: (location.pathname.match(/\/call\/([A-Za-z0-9]+)/)||[])[1] || null })) };
};

export default async ({ page }) => {
  const hit = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/^Schedule meeting$/i.test((x.innerText||'').trim()));
    if (!b) return false; b.click(); return true; });
  await page.waitForTimeout(2500);
  return { clicked: hit, dialog: await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    if (!d) return 'no dialog';
    return { text: (d.innerText||'').replace(/\n+/g,' | ').slice(0,300),
             inputs: [...d.querySelectorAll('input,textarea,select')].filter(v)
               .map(i=>({ tag:i.tagName, type:i.type, tid:i.getAttribute('data-testid'),
                          ph:i.getAttribute('placeholder'), val:(i.value||'').slice(0,24) })),
             buttons: [...d.querySelectorAll('button')].filter(v)
               .map(b=>(b.innerText||'').trim().slice(0,22)).filter(Boolean).slice(0,12) }; }) };
};

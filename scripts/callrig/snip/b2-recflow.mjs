export default async ({ page }) => {
  const out = {};
  const click = async (sel) => page.evaluate(s => { const e=document.querySelector(s);
    if (!e || e.getBoundingClientRect().width===0) return false; e.click(); return true; }, sel);
  out.startTrigger = await click('[data-testid="recording-start-access-trigger"]');
  await page.waitForTimeout(2500);
  out.dialog = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    return d ? { text:d.innerText.replace(/\n+/g,' | ').slice(0,180),
                 btns:[...d.querySelectorAll('button')].filter(v).map(b=>b.innerText.trim().slice(0,24)).filter(Boolean) } : null;
  });
  // confirm start
  await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    const b = d && [...d.querySelectorAll('button')].filter(v)
      .find(x=>/^(Start recording|Start|Record)$/i.test((x.innerText||'').trim()));
    if (b) b.click(); });
  await page.waitForTimeout(9000);
  out.afterStart = await page.evaluate(() => (document.body.innerText.match(/Recording[^|\n]{0,30}/)||['—'])[0]);
  return out;
};

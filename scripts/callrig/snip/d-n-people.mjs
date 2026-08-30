export default async ({page}) => {
  const out={};
  const t = page.locator('[data-testid="call-controls-people-toggle"]');
  out.toggleFound = await t.count();
  if (out.toggleFound) {
    out.pressed0 = await t.first().getAttribute('aria-pressed');
    if (out.pressed0 !== 'true') { await t.first().click(); await page.waitForTimeout(2000); }
    out.pressed1 = await t.first().getAttribute('aria-pressed');
  }
  out.panel = await page.evaluate(()=>{
    const p = document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return null;
    return {text:(p.innerText||'').replace(/\s+/g,' ').slice(0,600),
      btns:[...p.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>1).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,30)};
  });
  return out;
};

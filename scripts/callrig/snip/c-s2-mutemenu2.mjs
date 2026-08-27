export default async ({page}) => {
  const sel='button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  const open=await page.evaluate((s)=>document.querySelector(s).getAttribute('aria-expanded'), sel);
  if (open!=='true') { await page.locator(sel).first().click(); await page.waitForTimeout(900); }
  const info=await page.evaluate(()=>{
    const wrap=document.querySelector('[data-radix-popper-content-wrapper]');
    if (!wrap) return {noWrap:true};
    const kids=[...wrap.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width>20&&r.height>10;});
    return {n:kids.length, rows:kids.slice(0,14).map(e=>{const r=e.getBoundingClientRect();
      return {tag:e.tagName, role:e.getAttribute('role'), aria:e.getAttribute('aria-label'),
        txt:(e.textContent||'').trim().slice(0,32), y:Math.round(r.y), h:Math.round(r.height)};})};
  });
  return info;
};

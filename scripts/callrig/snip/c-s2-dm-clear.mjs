const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  const out={};
  // hover the sidebar DM row to reveal its card menu
  const row = page.locator(`a[href*="/d/${DM}"]`).first();
  await row.hover(); await page.waitForTimeout(900);
  out.afterHover = await page.evaluate((dm)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const a=[...document.querySelectorAll('a')].find(x=>(x.getAttribute('href')||'').includes('/d/'+dm));
    const parent=a? a.parentElement:null;
    return {rowHTMLButtons: parent? [...parent.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)):null};
  }, DM);
  // try right-click too
  await row.click({button:'right'}).catch(()=>{});
  await page.waitForTimeout(1200);
  out.afterRightClick = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const pops=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"],[role="dialog"]')].filter(vis);
    return pops.map(p=>({text:p.innerText.replace(/\n+/g,' | ').slice(0,220),
      items:[...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32)).filter(Boolean)}));
  });
  return out;
};

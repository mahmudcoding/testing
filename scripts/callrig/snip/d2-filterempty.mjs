export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const inp = page.locator('input[placeholder="Filter settings"]');
  const snap = () => page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const i=document.querySelector('input[placeholder="Filter settings"]');
    // the nav container that holds the settings links
    let nav=i; while(nav && nav.querySelectorAll('a[href*="/settings/"]').length===0 && nav!==document.body) nav=nav.parentElement;
    if(nav===document.body){ nav=document.querySelector('nav')||document.body; }
    return {navTag:nav.tagName.toLowerCase(),
      navText:(nav.innerText||'').replace(/\s+/g,' ').trim().slice(0,220),
      navHeightPx:Math.round(nav.getBoundingClientRect().height),
      links:[...nav.querySelectorAll('a')].filter(vis).length,
      groupHeadings:[...nav.querySelectorAll('*')].filter(e=>e.children.length===0&&vis(e))
        .map(e=>e.textContent.trim()).filter(t=>/^[A-Z ]{3,}$/.test(t))};
  });
  const out={before: await snap()};
  await inp.fill('xyzzy');
  await page.waitForTimeout(1200);
  out.noMatch = await snap();
  await inp.fill('');
  await page.waitForTimeout(800);
  out.after = await snap();
  return out;
};

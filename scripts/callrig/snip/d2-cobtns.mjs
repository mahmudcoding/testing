export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const m=document.querySelector('main');
    return {buttons:[...m.querySelectorAll('button,a[href]')].filter(vis)
        .map(b=>({tag:b.tagName.toLowerCase(), txt:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,32),
                  aria:b.getAttribute('aria-label')||'', href:b.getAttribute('href')||'',
                  y:Math.round(b.getBoundingClientRect().top)})),
      txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,700)};
  });
};

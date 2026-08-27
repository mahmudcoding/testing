export default async ({page}) => {
  await page.goto('https://airion-cargo.store/reset-password?token=bogus123',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const f=page.locator('input[type=password]');
  await f.nth(0).fill('BrandNewPw123'); await f.nth(1).fill('BrandNewPw123');
  await page.waitForTimeout(500);
  await page.locator('button').filter({hasText:/^Reset password$/}).first().click();
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    // is "Request a new one" inside a link/button?
    const node=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /Request a new one/i.test(e.textContent||''))[0];
    let wrap=null;
    if(node){ let p=node; for(let i=0;i<5&&p;i++,p=p.parentElement){ if(/^(A|BUTTON)$/.test(p.tagName)){wrap=p.tagName+' href='+(p.getAttribute('href')||'');break;} } }
    return {
      allControls:[...document.querySelectorAll('button,a')].filter(vis)
        .map(b=>`${b.tagName.toLowerCase()}${b.disabled?'(dis)':''} href=${b.getAttribute('href')||'-'}: ${((b.getAttribute('aria-label')||b.innerText)||'').replace(/\s+/g,' ').trim().slice(0,36)}`),
      requestNewOneIsLink: wrap,
      body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,300)};
  });
};

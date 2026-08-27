export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/workspaces',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const grab = () => page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    return {txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,900),
      ctrls:[...m.querySelectorAll('button,a[href],input')].filter(vis).filter(e=>!/Filter settings/.test(e.placeholder||''))
        .map(e=>`${e.tagName.toLowerCase()}${e.disabled?'(dis)':''}:${((e.getAttribute('aria-label')||e.innerText)||'').replace(/\s+/g,' ').trim().slice(0,40)}`)};
  });
  const before = await grab();
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname}${u.search} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  await page.locator('main button').filter({hasText:/^Show storage$/}).first().click();
  await page.waitForTimeout(4000);
  page.off('response', on);
  const after = await grab();
  return {before, storageReqs: reqs, after};
};

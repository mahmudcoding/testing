export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/company',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const grab = () => page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const m=document.querySelector('main');
    return {tabs:[...m.querySelectorAll('[role=tab]')].filter(vis).map(t=>`${t.innerText.trim()}${t.getAttribute('aria-selected')==='true'?'*':''}`),
      ctrls:[...m.querySelectorAll('button,a[href],input')].filter(vis).filter(e=>!/Filter settings/.test(e.placeholder||''))
        .map(b=>`${b.tagName.toLowerCase()}${b.disabled?'(dis)':''}: ${((b.getAttribute('aria-label')||b.innerText)||'').replace(/\s+/g,' ').trim().slice(0,40)}`),
      txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,900)};
  });
  const out={overview: await grab()};
  const mt = page.locator('main [role=tab]').filter({hasText:/^Manage$/}).first();
  out.manageTabFound = await mt.count();
  if (out.manageTabFound) {
    const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
    page.on('response', on);
    await mt.scrollIntoViewIfNeeded(); await mt.click(); await page.waitForTimeout(4500);
    out.manageReqs=reqs.slice(); page.off('response', on);
    out.manage = await grab();
  }
  return out;
};

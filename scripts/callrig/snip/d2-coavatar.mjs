export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', path=process.env.QA_FILE;
  const page_ = process.env.QA_PAGE || 'company';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/${page_}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const out={page:page_};
  out.before = await page.evaluate(async(CO)=>{
    const c=await (await fetch(`/api/v1/companies/${CO}`,{credentials:'include'})).text();
    const w=await (await fetch(`/api/v1/users/me/workspaces`,{credentials:'include'})).text();
    return {company:(c.match(/"avatar_url":"[^"]*"/)||['(no avatar_url)'])[0],
            workspaces:(w.match(/"avatar_url":"[^"]*"/)||['(no avatar_url)'])[0]};
  }, CO);
  const fi = page.locator('main input[type=file]');
  out.fileInputs = await fi.count();
  if (!out.fileInputs) return out;
  await fi.first().setInputFiles(path);
  await page.waitForTimeout(2500);
  out.crop = await page.evaluate(()=>{const d=document.querySelector('[role=dialog]');
    return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,90):null;});
  if (out.crop) {
    await page.evaluate(()=>{const d=document.querySelector('[role=dialog]');
      const b=[...d.querySelectorAll('button')].find(x=>/^Apply$/.test(x.innerText.trim())); if(b)b.click();});
    await page.waitForTimeout(3000);
  }
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET') reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  const save = page.locator('main button').filter({hasText:/^(Save changes|Save)$/});
  out.saveCount = await save.count();
  if (out.saveCount) { await save.last().scrollIntoViewIfNeeded(); await save.last().click(); await page.waitForTimeout(7000); }
  page.off('response', on);
  out.reqs = reqs.filter(r=>!/rum/.test(r));
  out.after = await page.evaluate(async(CO)=>{
    const c=await (await fetch(`/api/v1/companies/${CO}`,{credentials:'include'})).text();
    const w=await (await fetch(`/api/v1/users/me/workspaces`,{credentials:'include'})).text();
    return {company:(c.match(/"avatar_url":"[^"]*"/)||['(no avatar_url)'])[0],
            workspaces:(w.match(/"avatar_url":"[^"]*"/)||['(no avatar_url)'])[0]};
  }, CO);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/${page_}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.imgsAfterReload = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    return [...document.querySelectorAll('main img')].filter(vis).map(i=>(i.getAttribute('src')||'').slice(0,60));
  });
  return out;
};

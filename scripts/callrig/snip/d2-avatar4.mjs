export default async ({page}) => {
  const WS='W4QDF1XTURESO01', path=process.env.QA_FILE;
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const all = (tag) => page.evaluate((tag)=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const m=document.querySelector('main')||document.body;
    const d=document.querySelector('[role=dialog]');
    return {tag, dialogOpen:!!d,
      buttons:[...m.querySelectorAll('button')].filter(vis).map(b=>`${b.disabled?'(dis)':''}${(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)}`),
      avatarImgs:[...m.querySelectorAll('img')].filter(vis).map(i=>(i.getAttribute('src')||'').slice(0,60))};
  }, tag);
  const out={before: await all('before')};
  await page.locator('main input[type=file]').first().setInputFiles(path);
  await page.waitForTimeout(2500);
  out.cropOpen = await all('cropOpen');
  const clicked = await page.evaluate(()=>{
    const d=document.querySelector('[role=dialog]'); if(!d) return 'no dialog';
    const b=[...d.querySelectorAll('button')].find(x=>/^Apply$/.test(x.innerText.trim()));
    if(!b) return 'no Apply';
    const r=b.getBoundingClientRect();
    const top=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
    const ok = top===b||b.contains(top);
    b.click();
    return {clickedTopmost:ok, topTag:top?top.tagName:'null'};
  });
  out.applyClick = clicked;
  await page.waitForTimeout(4000);
  out.afterApply = await all('afterApply');
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET') reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  // if a save control appeared, press it
  const save = page.locator('main button').filter({hasText:/^(Save changes|Save profile|Save)$/});
  out.saveCount = await save.count();
  if (out.saveCount) { await save.last().scrollIntoViewIfNeeded(); await save.last().click(); await page.waitForTimeout(6000); }
  page.off('response', on);
  out.saveReqs = reqs.filter(r=>!/rum/.test(r));
  out.avatarApi = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();return j.avatar_url||null;});
  return out;
};

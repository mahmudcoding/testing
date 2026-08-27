export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  // pick a role, then create
  await page.locator('main button', {hasText:/Select a role|No role|Member ·/i}).first().click();
  await page.waitForTimeout(1500);
  const opt = page.locator('[role="option"]', {hasText:/Member · Workspace role/i}).first();
  if (await opt.count()) { await opt.click(); } else { await page.locator('[role="option"]').first().click(); }
  await page.waitForTimeout(1500);
  const btn = page.locator('main button', {hasText:/^Create invite link$/i}).first();
  const [resp] = await Promise.all([
    page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()==='POST',{timeout:15000}).catch(()=>null),
    btn.click()
  ]);
  await page.waitForTimeout(3000);
  res.create = resp?{s:resp.status(), u:resp.url().replace('https://airion-cargo.store','')}:'no POST';
  res.after = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const b=[]; m.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) b.push(((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,34));});
    return {text:(m.innerText||'').replace(/\s+/g,' ').slice(280,1000), btns:[...new Set(b)]};
  });
  // find the link value shown to the admin
  res.linkShown = await page.evaluate(()=>{
    const hits=[];
    document.querySelectorAll('main input, main code, main a, main span').forEach(x=>{
      const v=(x.value||x.innerText||'').trim();
      if(/invite|join/i.test(v) && v.length<160) hits.push(v.slice(0,140));
    });
    return [...new Set(hits)].slice(0,6);
  });
  return res;
};

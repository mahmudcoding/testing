export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const res={};
  // expand the collapsed invite row if there is a disclosure control
  const disc = page.locator('main button, main [role="button"]').filter({hasText:/^›$/}).first();
  if (await disc.count()) { try{ await disc.click(); await page.waitForTimeout(1500);}catch(e){res.discErr=String(e).slice(0,60);} }
  const btn = page.locator('main button', {hasText:/^Revoke invite$/i}).first();
  res.count = await btn.count();
  if (res.count) {
    try { await btn.scrollIntoViewIfNeeded({timeout:5000}); } catch(e) { res.scrollErr=String(e).slice(0,60); }
    res.box = await btn.boundingBox();
    try {
      const [resp]=await Promise.all([
        page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()!=='GET',{timeout:10000}).catch(()=>null),
        btn.click({force:true, timeout:8000})
      ]);
      await page.waitForTimeout(1800);
      const conf = page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/revoke|confirm|yes/i}).last();
      if (await conf.count()) { await conf.click(); await page.waitForTimeout(2500); }
      res.resp = resp?{s:resp.status(), m:resp.request().method(), u:resp.url().replace('https://airion-cargo.store','').slice(0,60)}:'no request';
    } catch(e) { res.clickErr=String(e).slice(0,140); }
  }
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  res.after = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');const i=t.indexOf('Invite links');return t.slice(i,i+200);});
  return res;
};

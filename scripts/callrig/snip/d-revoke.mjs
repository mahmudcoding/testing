export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');const i=t.indexOf('Invite links');return t.slice(i,i+220);});
  const res={before, revoked:[]};
  for (let n=0; n<4; n++) {
    const btn = page.locator('main button', {hasText:/^Revoke invite$/i}).first();
    if (!(await btn.count())) break;
    const [resp] = await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()!=='GET',{timeout:10000}).catch(()=>null),
      btn.click()
    ]);
    await page.waitForTimeout(1500);
    const conf = page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/revoke|confirm|yes|delete/i}).last();
    if (await conf.count()) { await conf.click(); await page.waitForTimeout(2000); }
    res.revoked.push(resp?{s:resp.status(), m:resp.request().method(), u:resp.url().replace('https://airion-cargo.store','').slice(0,60)}:'no request');
    await page.waitForTimeout(1500);
  }
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  res.after = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');const i=t.indexOf('Invite links');return t.slice(i,i+220);});
  return res;
};

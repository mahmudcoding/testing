export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/sessions`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const before = await page.evaluate(()=>{const m=document.querySelector('main');return (m.innerText||'').replace(/\s+/g,' ').slice(140,900);});
  const b = page.locator('main button', {hasText:/Sign out other sessions/i}).first();
  const [resp] = await Promise.all([
    page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()!=='GET',{timeout:12000}).catch(()=>null),
    b.click()
  ]);
  await page.waitForTimeout(1500);
  // a confirm dialog may appear
  const dlg = await page.evaluate(()=>{const d=document.querySelector('[role="dialog"],[role="alertdialog"]');if(!d)return null;const btns=[];d.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)btns.push(((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,30));});return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,300), btns};});
  let confirmResp=null;
  if (dlg) {
    const c = page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/sign out|confirm|yes/i}).last();
    if (await c.count()) { const [r2]=await Promise.all([page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()!=='GET',{timeout:12000}).catch(()=>null), c.click()]); confirmResp = r2?{s:r2.status(),m:r2.request().method(),u:r2.url().replace('https://airion-cargo.store','')}:'none'; }
  }
  await page.waitForTimeout(3000);
  const after = await page.evaluate(()=>{const m=document.querySelector('main');return (m.innerText||'').replace(/\s+/g,' ').slice(140,900);});
  return {before, firstResp: resp?{s:resp.status(),m:resp.request().method(),u:resp.url().replace('https://airion-cargo.store','')}:'none', dlg, confirmResp, after};
};

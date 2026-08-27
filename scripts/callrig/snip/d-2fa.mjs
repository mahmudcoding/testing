export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/security`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  res.page = await page.evaluate(()=>{const m=document.querySelector('main');return (m.innerText||'').replace(/\s+/g,' ').slice(150,900);});
  const en = page.locator('main button', {hasText:/^Enable$/i}).first();
  if(!(await en.count())) return {...res, note:'no Enable button'};
  const [resp] = await Promise.all([
    page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()!=='GET',{timeout:12000}).catch(()=>null),
    en.click()
  ]);
  await page.waitForTimeout(3000);
  res.enableResp = resp?{s:resp.status(), m:resp.request().method(), u:resp.url().replace('https://airion-cargo.store','')}:'no non-GET request';
  res.afterEnable = await page.evaluate(()=>{
    const d=document.querySelector('[role="dialog"],[role="alertdialog"]');
    const scope=d||document.querySelector('main');
    const btns=[]; scope.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) btns.push({l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,30), dis:!!x.disabled});});
    const imgs=[]; scope.querySelectorAll('img,canvas,svg').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>20&&r.height>20) imgs.push({tag:x.tagName.toLowerCase(), w:Math.round(r.width), h:Math.round(r.height), src:(x.getAttribute('src')||'').slice(0,40)});});
    const ins=[]; scope.querySelectorAll('input').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) ins.push({ph:x.placeholder||'', al:x.getAttribute('aria-label')||'', t:x.type});});
    return {isDialog:!!d, text:(scope.innerText||'').replace(/\s+/g,' ').slice(0,450), btns, imgs, ins};
  });
  return res;
};

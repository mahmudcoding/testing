export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const before = await page.evaluate(() => {
    const main=document.querySelector('main')||document.body;
    const inputs=[]; main.querySelectorAll('input,textarea').forEach(b=>{const r=b.getBoundingClientRect(); if(r.width>0&&r.height>0) inputs.push({lab:(b.getAttribute('aria-label')||b.getAttribute('name')||b.getAttribute('placeholder')||'?').slice(0,30), val:(b.value||'').slice(0,40), dis:b.disabled, ro:b.readOnly});});
    const btns=[]; main.querySelectorAll('button').forEach(b=>{const r=b.getBoundingClientRect(); if(r.width>0&&r.height>0) btns.push({l:((b.innerText||'').trim()||b.getAttribute('aria-label')||'?').slice(0,30), dis:b.disabled});});
    return {inputs, btns, txt:(main.innerText||'').replace(/\s+/g,' ').slice(200,900)};
  });
  // try typing into the company name field
  let typed=null;
  const inp = page.locator('main input').first();
  if (await inp.count()) {
    try { await inp.fill('QA Fixtures D HACK'); await page.waitForTimeout(1200);
      typed = await page.evaluate(()=>{
        const main=document.querySelector('main');
        const v=main.querySelector('input')?.value;
        const btns=[]; main.querySelectorAll('button').forEach(b=>{const r=b.getBoundingClientRect(); if(r.width>0&&r.height>0) btns.push({l:((b.innerText||'').trim()||b.getAttribute('aria-label')||'?').slice(0,30), dis:b.disabled});});
        return {v, btns};
      });
    } catch(e) { typed={err:String(e).slice(0,120)}; }
  }
  // probe the API directly as bob
  const api = await page.evaluate(async () => {
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return {email:me.email};
  });
  return {api, before, typed};
};

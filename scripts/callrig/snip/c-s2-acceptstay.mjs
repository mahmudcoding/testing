export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  const now=()=>new Date().toISOString();
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(1000);
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(9000);
  for(let i=0;i<130;i++){
    const hit=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const b=[...document.querySelectorAll('button,[role="button"]')].filter(v)
        .find(x=>/^(accept|join|answer)$/i.test((x.innerText||'').trim())
          || /accept|join call|answer/i.test(x.getAttribute('aria-label')||''));
      if(b){ b.click(); return true; } return false;});
    if(hit){ out.acceptedAt=now(); break; }
    await page.waitForTimeout(500);
  }
  if(!out.acceptedAt) return {err:'no accept control appeared'};
  // stay in the call; the caller will leave first
  await page.waitForTimeout(26000);
  out.timerBeforeMyLeave=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v).find(x=>/Call with|Call ended/.test(x.innerText||''));
    return d? (d.innerText||'').replace(/\s+/g,' ').slice(0,60):null;});
  const btn=page.locator('button[aria-label="Leave call"]').first();
  if(await btn.count()){
    await btn.click(); await page.waitForTimeout(1600);
    const dlg=page.locator('[role="alertdialog"], [role="dialog"]').filter({hasText:'Leave this call?'}).first();
    if(await dlg.count()) await dlg.locator('button').filter({hasText:/^Leave$/}).first().click();
    out.leftAt=now(); out.leftBy='button';
  } else { out.leftBy='no leave button'; }
  await page.waitForTimeout(4000);
  out.stillInCall=/\/call\//.test(page.url());
  return out;
};

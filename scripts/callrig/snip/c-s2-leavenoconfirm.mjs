export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  const now=()=>new Date().toISOString();
  const out={role:process.env.QA_ROLE||'callee'};
  await page.goto('about:blank'); await page.waitForTimeout(900);
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(9000);
  if(out.role==='caller'){
    await page.locator('button[aria-label="Start call"]').first().click();
    out.startedAt=now();
  } else {
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
    if(!out.acceptedAt) return {...out, err:'no accept control'};
  }
  await page.waitForTimeout(parseInt(process.env.QA_HOLD||'13000',10));
  // click Leave call but DO NOT confirm — exactly what a snippet without dialog handling does
  const btn=page.locator('button[aria-label="Leave call"]').first();
  out.leaveButtonFound=await btn.count();
  if(out.leaveButtonFound){
    await btn.click().catch(e=>{ out.clickError=String(e).slice(0,60); });
    out.clickedLeaveAt=now();
  }
  await page.waitForTimeout(3000);
  out.confirmDialogOpen=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)
      .some(d=>/Leave this call\?/.test(d.innerText||''));});
  out.stillInCall=/\/call\//.test(page.url());
  return out;
};

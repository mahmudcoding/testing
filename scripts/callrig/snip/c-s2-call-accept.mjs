export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(8000);
  const now=()=>new Date().toISOString();
  out.readyAt=now();
  // poll for an accept control
  let accepted=null;
  for(let i=0;i<110;i++){
    const btn=page.locator('button').filter({hasText:/^(Accept|Join|Answer)$/}).first();
    const alt=page.locator('button[aria-label="Accept call"], button[aria-label="Accept"], button[aria-label="Join call"]').first();
    if(await btn.count()){ await btn.click(); accepted=now(); break; }
    if(await alt.count()){ await alt.click(); accepted=now(); break; }
    await page.waitForTimeout(700);
  }
  out.acceptedAt=accepted;
  if(!accepted){
    out.visibleButtons=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('button')].filter(v)
        .map(b=>b.getAttribute('aria-label')||(b.innerText||'').trim().slice(0,18)).filter(Boolean).slice(0,20);});
    return out;
  }
  await page.waitForTimeout(12000);
  out.inCallUrl=page.url().slice(-24);
  const leave=page.locator('button[aria-label="Leave call"], button[aria-label="End call"]').first();
  out.leaveFound=await leave.count();
  if(out.leaveFound){ await leave.click(); out.leftAt=now(); await page.waitForTimeout(2500);
    const conf=page.locator('button[data-testid="call-end-confirm-submit"], button').filter({hasText:/^(Leave|Leave call|End)$/}).first();
    if(await conf.count()){ await conf.click(); await page.waitForTimeout(2000); } }
  else {
    out.callButtons=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('button')].filter(v)
        .map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,20);});
  }
  return out;
};

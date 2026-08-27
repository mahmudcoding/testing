export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const out={};
  const btn=page.locator('button[aria-label="Channel details"]').first();
  out.btnFound=await btn.count();
  if(!out.btnFound) return out;
  await btn.focus(); await page.waitForTimeout(400);
  out.focusedBefore=await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')
    ||document.activeElement?.textContent?.trim().slice(0,30)||document.activeElement?.tagName);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const probe=async()=>await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    const panel=[...document.querySelectorAll('aside,[role="complementary"],[role="dialog"]')]
      .filter(v).find(e=>/Channel details|About|Members/i.test(e.innerText||''));
    const a=document.activeElement;
    return {panelOpen:!!panel, inPanel: !!(panel&&a&&panel.contains(a)),
      active:(a?.getAttribute('aria-label')||a?.textContent?.trim().slice(0,26)||a?.tagName||'')};});
  out.rightAfterEnter=await probe();
  out.msgsRendered=await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length);
  const path=[];
  for(let i=1;i<=170;i++){
    await page.keyboard.press('Tab');
    const p=await probe();
    if(i<=9) path.push(p.active);
    if(p.inPanel){ out.reachedAtTab=i; out.firstInPanel=p.active; break; }
  }
  out.pathFirst9=path;
  if(!out.reachedAtTab) out.reachedAtTab='>170';
  return out;
};

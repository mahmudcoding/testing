export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  out.renderedMessages=await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length);
  const btn=page.locator('button[aria-label="Channel details"]').first();
  out.buttonFound=await btn.count();
  if(!out.buttonFound) return out;
  await btn.focus();
  out.focusedBefore=await page.evaluate(()=>{
    const a=document.activeElement; return a? (a.getAttribute('aria-label')||a.tagName):null;});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const panelState=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const panel=[...document.querySelectorAll('aside,[role="dialog"],section')].filter(v)
      .filter(d=>/Channel details|About|Members/i.test(d.innerText||''))
      .sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
    const a=document.activeElement;
    return {panelOpen:!!panel,
      focusInPanel: !!(panel&&a&&panel.contains(a)),
      active:a? (a.getAttribute('aria-label')||a.tagName):null};});
  out.rightAfterEnter=await panelState();
  // Tab forward, checking every 10 presses
  let reached=null;
  for(let i=1;i<=160;i++){
    await page.keyboard.press('Tab');
    if(i%10===0){
      const s=await panelState();
      if(s.focusInPanel){ reached=i; break; }
    }
  }
  out.tabsToReachPanel = reached===null? '>160' : `<=${reached}`;
  out.finalState=await panelState();
  out.PASS = out.rightAfterEnter.panelOpen===true && out.rightAfterEnter.focusInPanel===false;
  return out;
};

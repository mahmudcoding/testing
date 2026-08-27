export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  out.renderedMessages=await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length);
  const btn=page.locator('button[aria-label="Channel details"]').first();
  await btn.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const state=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const trigger=document.querySelector('button[aria-label="Channel details"]');
    // the panel: a visible container that holds the About/Members tabs and does NOT hold the trigger
    const cands=[...document.querySelectorAll('aside,[role="dialog"],section,div')].filter(v)
      .filter(d=>/About/.test(d.innerText||'') && /Members/.test(d.innerText||''))
      .filter(d=>!(trigger && d.contains(trigger)));
    cands.sort((a,b)=>(a.getBoundingClientRect().width*a.getBoundingClientRect().height)
                     -(b.getBoundingClientRect().width*b.getBoundingClientRect().height));
    const panel=cands[0]||null;
    const a=document.activeElement;
    return {panelFound:!!panel,
      panelRect: panel? [Math.round(panel.getBoundingClientRect().left),Math.round(panel.getBoundingClientRect().width)]:null,
      focusInPanel: !!(panel&&a&&panel.contains(a)),
      active: a? (a.getAttribute('aria-label')||(a.innerText||'').trim().slice(0,18)||a.tagName):null,
      activeIsTrigger: a===trigger};});
  out.rightAfterEnter=await state();
  const path=[];
  let reached=null;
  for(let i=1;i<=200;i++){
    await page.keyboard.press('Tab');
    if(i<=12 || i%20===0){
      const s=await state();
      if(i<=12) path.push(`${i}:${s.active}`);
      if(s.focusInPanel){ reached=i; break; }
    }
  }
  out.firstTabs=path;
  out.tabsToReachPanel = reached===null? '>200' : reached;
  out.PASS = out.rightAfterEnter.panelFound && out.rightAfterEnter.activeIsTrigger
             && !out.rightAfterEnter.focusInPanel;
  return out;
};

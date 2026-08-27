const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(9000);
  const out={};
  // focus the Channel details button explicitly, then open it with the keyboard
  await page.locator('button[aria-label="Channel details"]').last().focus();
  out.beforeOpen = await page.evaluate(()=>({label:(document.activeElement.getAttribute('aria-label')||'').slice(0,30)}));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2800);
  out.afterOpen = await page.evaluate(()=>{
    const a=document.activeElement;
    const panel=document.querySelector('[role="tabpanel"]');
    return {focused:(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,34), tag:a.tagName,
      panelPresent: !!panel, focusInsidePanel: panel? panel.contains(a) : null,
      panelHasTabs: document.querySelectorAll('[role="tab"]').length};
  });
  // count Tab presses until focus lands inside the panel
  let steps=0, landed=false, seen=[];
  for (let i=0;i<80;i++){
    await page.keyboard.press('Tab'); await page.waitForTimeout(90); steps++;
    const st = await page.evaluate(()=>{
      const a=document.activeElement;
      let panel=null;
      for (const t of document.querySelectorAll('[role="tab"]')) { let p=t; for(let k=0;k<6&&p;k++) p=p.parentElement; }
      const tabs=[...document.querySelectorAll('[role="tab"]')];
      const container = tabs.length? tabs[0].closest('div[class*="flex"]')?.parentElement : null;
      const inPanel = (container && container.contains(a)) || (document.querySelector('[role="tabpanel"]')||{contains:()=>false}).contains(a)
        || /^(About|Members|Roles|Files|Pinned|Save|Archive channel|Leave channel|Close channel details)/.test((a.getAttribute('aria-label')||a.textContent||'').trim());
      return {l:(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,30), inPanel};
    });
    seen.push(st.l);
    if (st.inPanel) { landed=true; break; }
  }
  out.tabsToPanel = landed? steps : null;
  out.landedOn = landed? seen[seen.length-1] : null;
  out.pathSample = seen.slice(0,10);
  out.totalTried = steps;
  return out;
};

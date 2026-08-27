const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(9000);
  const out={};
  const active=()=>page.evaluate(()=>{
    const a=document.activeElement;
    const cs=a? getComputedStyle(a):null;
    const r=a? a.getBoundingClientRect():null;
    return {tag:a&&a.tagName, label:a&&(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,34),
      role:a&&a.getAttribute('role'),
      outline: cs? (cs.outlineStyle+' '+cs.outlineWidth) : null,
      boxShadow: cs? cs.boxShadow.slice(0,30) : null,
      visible: r? (r.width>0&&r.height>0) : false,
      inViewport: r? (r.y>=0 && r.y<innerHeight) : null};
  });
  // Tab from the top of the document
  await page.evaluate(()=>{ document.body.focus(); if(document.activeElement) document.activeElement.blur(); });
  const chain=[];
  for (let i=0;i<20;i++){ await page.keyboard.press('Tab'); await page.waitForTimeout(200); chain.push(await active()); }
  out.tabChain = chain.map(c=>({l:c.label, tag:c.tag, focusRing: c.outline!=='none 0px' || (c.boxShadow&&c.boxShadow!=='none'), vis:c.visible}));
  out.noFocusRing = chain.filter(c=> c.visible && c.outline==='none 0px' && (!c.boxShadow || c.boxShadow==='none')).map(c=>c.label).slice(0,6);
  // focus trap: open a dialog and Tab around
  await page.locator('button[aria-label="Channel details"]').last().click({timeout:10000});
  await page.waitForTimeout(2500);
  const dchain=[];
  for (let i=0;i<12;i++){ await page.keyboard.press('Tab'); await page.waitForTimeout(180); dchain.push(await active()); }
  out.panelChain = dchain.map(c=>c.label);
  out.escClosesPanel = await (async()=>{
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
    return await page.evaluate(()=>({panelOpen: !!document.querySelector('[role="tabpanel"]'),
      detailsBtn: !!document.querySelector('button[aria-label="Channel details"]')}));
  })();
  return out;
};

export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  // unpin the text one, keep the image-only one
  const va=page.locator('button').filter({hasText:/View all/}).first();
  if(await va.count()){ await va.click(); await page.waitForTimeout(2200);
    out.panelList=await page.evaluate(()=>{
      const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
      if(!d) return 'no dialog';
      return [...d.querySelectorAll('[data-message-id]')].map(e=>({id:e.getAttribute('data-message-id'),
        imgs:e.querySelectorAll('img').length, txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,50)}));});
    // unpin the one that has text
    const target=await page.evaluate(()=>{
      const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
      const e=[...d.querySelectorAll('[data-message-id]')].find(x=>/FWDIMG/.test(x.innerText||''));
      if(!e) return null;
      const b=[...e.querySelectorAll('button')].find(x=>/Unpin/i.test(x.getAttribute('aria-label')||''));
      if(b){ b.setAttribute('data-qa-unpin','1'); return 'inline'; }
      e.setAttribute('data-qa-row','1'); return 'row';});
    out.target=target;
    if(target==='inline'){ await page.locator('[data-qa-unpin="1"]').click(); await page.waitForTimeout(2000); }
    else if(target==='row'){
      await page.locator('[data-qa-row="1"]').hover(); await page.waitForTimeout(600);
      const up=page.locator('[role="dialog"] button[aria-label*="Unpin"]').first();
      if(await up.count()){ await up.click(); await page.waitForTimeout(2000); }
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  }
  await page.reload(); await page.waitForTimeout(7000);
  out.strip=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    return [...new Set([...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/Pinned|View all|no message text/i.test(t)&&t.length<60))];
  });
  return out;
};

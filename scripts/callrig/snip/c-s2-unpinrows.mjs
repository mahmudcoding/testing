export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const out={done:[]};
  for (const tag of ['QA-S2-FWDIMG', null]) {
    const el = tag? page.locator('main [data-message-id]').filter({hasText:tag}).last()
                  : page.locator('main [data-message-id]').last();
    if(!await el.count()) continue;
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
    const inline=el.locator('button[aria-label="Unpin message"]');
    if(await inline.count()){ await inline.first().click(); await page.waitForTimeout(1800); out.done.push('inline '+(tag||'last')); continue; }
    await el.locator('button[aria-label="More actions"]').first().click({force:true});
    await page.waitForTimeout(800);
    const up=page.locator('[role="menu"]').getByText('Unpin message',{exact:true}).first();
    if(await up.count()){ await up.click(); await page.waitForTimeout(1800); out.done.push('menu '+(tag||'last')); }
    else { await page.keyboard.press('Escape'); out.done.push('none '+(tag||'last')); }
  }
  await page.reload(); await page.waitForTimeout(6000);
  out.strip=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    return [...new Set([...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/Pinned|View all/i.test(t)&&t.length<50))];
  });
  return out;
};

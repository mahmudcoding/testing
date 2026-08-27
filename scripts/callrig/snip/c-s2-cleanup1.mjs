const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  // unpin everything
  try { await page.locator('button:visible').filter({hasText:/^View all \(/}).last().click({timeout:6000});
    await page.waitForTimeout(2000);
    for (let i=0;i<5;i++){ const b=page.locator('[role="dialog"] button[aria-label="Unpin"]').first();
      if(!(await b.count())) break; await b.click({timeout:6000}); await page.waitForTimeout(1800); }
    await page.keyboard.press('Escape'); await page.waitForTimeout(800); out.unpinned=true;
  } catch(e){ out.unpinErr=String(e).slice(0,70); }
  // delete the two long messages via API
  out.deleted = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=8',{credentials:'include'});
    const j=await r.json(); const list=j.messages||[];
    const targets=list.filter(m=>(m.body||'').length>800).map(m=>m.id);
    const res=[];
    for (const id of targets) {
      const d=await fetch(`/api/v1/messaging/messages/${id}`,{method:'DELETE',credentials:'include'});
      res.push({id:id.slice(-6), s:d.status});
    }
    return res;
  });
  return out;
};

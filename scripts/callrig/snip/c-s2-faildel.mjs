export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const delId=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-FAILDEL2 target', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  out.id=delId;
  await page.waitForTimeout(3000);
  let aborted=0;
  await page.route('**/messaging/channels/**', r=>{
    if(r.request().method()==='DELETE'){ aborted++; return r.abort('failed'); }
    return r.continue();
  });
  const el=page.locator(`[data-message-id="${delId}"]`);
  out.rendered=await el.count();
  if(!out.rendered) return out;
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  out.menu=await page.evaluate(()=>{const m=document.querySelector('[role="menu"]');
    return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):[];});
  const dl=page.locator('[role="menu"]').getByText('Delete',{exact:true}).first();
  out.deleteOffered=await dl.count();
  if(out.deleteOffered){ await dl.click(); await page.waitForTimeout(1300);
    out.dialog=await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')]
      .find(x=>x.getBoundingClientRect().height>20);
      return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,120):null;});
    const conf=page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/^Delete$/}).first();
    if(await conf.count()) await conf.click();
  }
  const s=[];
  for(let i=0;i<12;i++){ await page.waitForTimeout(500);
    s.push(await page.evaluate((id)=>{
      const e=document.querySelector(`[data-message-id="${id}"]`);
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      return {present:!!e,
        notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,50))};}, delId));
  }
  await page.unroute('**/messaging/channels/**');
  out.aborted=aborted;
  out.everAbsent=s.some(x=>!x.present);
  out.finalPresent=s.at(-1).present;
  out.notices=[...new Set(s.flatMap(x=>x.notices))];
  out.server=await page.evaluate(async({ch,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id);
    return m? 'still on server':'gone from server';}, {ch,id:delId});
  await page.reload(); await page.waitForTimeout(6500);
  out.afterReload=await page.evaluate((id)=>!!document.querySelector(`[data-message-id="${id}"]`), delId);
  return out;
};

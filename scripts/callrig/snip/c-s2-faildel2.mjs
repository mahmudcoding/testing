export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const id=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-FAILDEL3 target', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  out.id=id;
  await page.waitForTimeout(3000);
  let aborted=0;
  await page.route('**/messaging/channels/**', r=>{
    if(r.request().method()==='DELETE'){ aborted++; return r.abort('failed'); }
    return r.continue(); });
  const el=page.locator(`[data-message-id="${id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  await page.locator('[role="menu"]').getByText('Delete',{exact:true}).first().click();
  await page.waitForTimeout(1300);
  const snap=()=>page.evaluate((id)=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)[0];
    return {dialogOpen:!!d, dialogTxt:d?(d.innerText||'').replace(/\s+/g,' ').slice(0,90):null,
      dialogBtnsDisabled: d? [...d.querySelectorAll('button')].map(b=>b.disabled):null,
      msgPresent: !!document.querySelector(`[data-message-id="${id}"]`),
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
        .map(x=>x.textContent.trim().slice(0,50))};}, id);
  out.beforeConfirm=await snap();
  const conf=page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/^Delete$/}).first();
  await conf.click();
  const s=[]; for(let i=0;i<14;i++){ await page.waitForTimeout(500); s.push(await snap()); }
  await page.unroute('**/messaging/channels/**');
  out.aborted=aborted;
  out.t500=s[0]; out.t3000=s[5]; out.last=s.at(-1);
  out.dialogEverClosed=s.some(x=>!x.dialogOpen);
  out.noticesSeen=[...new Set(s.flatMap(x=>x.notices))];
  // clean up: actually delete it now
  await page.evaluate(async({ch,id})=>{
    await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[id]})});
  }, {ch,id});
  return out;
};

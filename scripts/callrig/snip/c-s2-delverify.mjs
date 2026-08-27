export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const tag='QA-DELVERIFY-'+Math.random().toString(36).slice(2,6);
  const seed=await page.evaluate(async ({ch,tag})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch, body:tag})});
    const j=await r.json(); return j.id||j.message?.id;},{ch,tag});
  await page.waitForTimeout(2000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={tag, id:seed};
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.route('**/api/v1/messaging/**', r=>
    r.request().method()==='DELETE' ? r.abort('failed') : r.continue());
  const seen=[];
  const onReq=(r)=>{ if(r.url().includes('/api/v1/')&&r.method()==='DELETE') seen.push('DELETE attempted'); };
  page.on('request',onReq);
  await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/^Delete$/}).first().click({timeout:6000}).catch(()=>{out.menuFail=true});
  await page.waitForTimeout(2500);
  const confirm=page.locator('[role="dialog"] button, [role="alertdialog"] button')
    .filter({hasText:/^Delete$/}).first();
  out.confirmFound=await confirm.count();
  if(out.confirmFound) await confirm.click({timeout:6000}).catch(()=>{out.confirmFail=true});
  // poll the author's own view for 9s
  const seenStates=new Set(); const toasts=new Set();
  for(let i=0;i<30;i++){
    const st=await page.evaluate((id)=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const el=document.querySelector(`[data-message-id="${id}"]`);
      return {txt:el?(el.innerText||'').replace(/\s+/g,' ').trim().slice(-42):'NODE-GONE',
        t:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').trim().slice(0,40)).filter(Boolean)};}, seed);
    seenStates.add(st.txt); st.t.forEach(x=>toasts.add(x));
    await page.waitForTimeout(300);
  }
  page.off('request',onReq);
  await page.unroute('**/api/v1/messaging/**');
  out.deleteAttempts=seen.length;
  out.authorStates=[...seenStates].slice(0,4);
  out.authorToasts=[...toasts].slice(0,3);
  out.serverStillHasIt=await page.evaluate(async ({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>x.id===id);
    return hit?{present:true, body:(hit.body||'').slice(0,26)}:{present:false};},{ch,id:seed});
  return out;
};

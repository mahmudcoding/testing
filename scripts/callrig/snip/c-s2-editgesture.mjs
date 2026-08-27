export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.keyboard.press('Escape');
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const mk=(txt)=>page.evaluate(async({ch,txt})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:txt, idempotency_key:'qeg-'+Math.random().toString(36).slice(2)})});
    const j=await r.json(); return {id:j.id};},{ch,txt});
  const T=await mk('QA-S2-EG-target');
  out.target=T;
  await page.reload(); await page.waitForTimeout(9000);
  const el=page.locator(`main [data-message-id="${T.id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
  await el.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1400);
  await page.getByText(/^Edit$/).first().click();
  await page.waitForTimeout(2000);
  // enumerate everything interactive in the composer area while editing
  out.editModeControls=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    if(!comp) return 'no composer';
    let box=comp; for(let i=0;i<6 && box.parentElement;i++) box=box.parentElement;
    return [...box.querySelectorAll('button,[role="button"],a')].filter(v)
      .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').slice(0,20),
        al:e.getAttribute('aria-label'), disabled:e.disabled===true,
        y:Math.round(e.getBoundingClientRect().top)}));});
  // change the text, then try the most likely confirm control
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await comp.type('QA-S2-EG-target-DONE',{delay:35}); await page.waitForTimeout(600);
  const cand=page.locator('button').filter({hasText:/^(Save|Save changes|Update|Done)$/}).first();
  out.saveButton=await cand.count();
  if(out.saveButton){ await cand.click(); }
  else {
    const sendBtn=page.locator('button[aria-label="Send message"], button[aria-label="Send"]').first();
    out.sendBtn=await sendBtn.count();
    if(out.sendBtn) await sendBtn.click();
  }
  await page.waitForTimeout(4000);
  out.after=await page.evaluate((id)=>{
    const e=document.querySelector(`main [data-message-id="${id}"]`);
    const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const main=document.querySelector('main');
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    const notice=[...main.querySelectorAll('*')].filter(x=>x.children.length===0&&v(x))
      .map(x=>(x.textContent||'').trim()).find(t=>/editing/i.test(t))||null;
    return {msgTail:e?(e.innerText||'').replace(/\s+/g,' ').slice(-34):'absent',
      composer:comp?comp.innerText.trim().slice(0,30):null, notice};}, T.id);
  out.server=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m?{body:m.body.slice(0,30), edited:m.edited}:'absent';},{ch,id:T.id});
  return out;
};

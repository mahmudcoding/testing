export default async ({page, ctx}) => {
  try { return await run({page,ctx}); } finally { await ctx.setOffline(false); }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const mk=(txt)=>page.evaluate(async({ch,txt})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:txt, idempotency_key:'qec-'+Math.random().toString(36).slice(2)})});
    const j=await r.json(); return {id:j.id, seq:j.channel_seq};},{ch,txt});
  const state=(id)=>page.evaluate((id)=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const el=document.querySelector(`main [data-message-id="${id}"]`);
    const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const main=document.querySelector('main');
    const editingNotice=[...main.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim()).find(t=>/editing/i.test(t))||null;
    return {msgTail: el? (el.innerText||'').replace(/\s+/g,' ').slice(-34):'absent',
      composer: comp? comp.innerText.trim().slice(0,32):null,
      editingNotice,
      toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
        .map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,44)))]};}, id);
  const doEdit=async(id, newText)=>{
    const el=page.locator(`main [data-message-id="${id}"]`);
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
    const more=el.locator('button[aria-label="More actions"]').first();
    if(!await more.count()) return {err:'no More actions'};
    await more.click(); await page.waitForTimeout(1400);
    const ed=page.getByText(/^Edit$/).first();
    if(!await ed.count()){ await page.keyboard.press('Escape'); return {err:'no Edit item'}; }
    await ed.click(); await page.waitForTimeout(1800);
    const inEdit=await state(id);
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await comp.type(newText,{delay:35}); await page.waitForTimeout(500);
    const typed=await state(id);
    const save=page.locator('button[aria-label="Save changes"]').first();
    const n=await save.count();
    const dis=n? await save.isDisabled() : null;
    if(n && !dis) await save.click();
    await page.waitForTimeout(3500);
    return {inEdit, typed, saveFound:n, saveDisabled:dis, afterSave:await state(id)};
  };
  // CONTROL: online
  const A=await mk('QA-S2-EC-online');
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`); await page.waitForTimeout(9000);
  out.online=await doEdit(A.id,'QA-S2-EC-online-DONE');
  out.onlineServer=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m?{body:m.body.slice(0,30), edited:m.edited}:'absent';},{ch,id:A.id});
  // SUBJECT: offline
  const B=await mk('QA-S2-EC-offline');
  await page.reload(); await page.waitForTimeout(9000);
  await ctx.setOffline(true); await page.waitForTimeout(1200);
  out.offline=await doEdit(B.id,'QA-S2-EC-offline-DONE');
  await ctx.setOffline(false); await page.waitForTimeout(15000);
  out.offlineAfterReconnect=await state(B.id);
  await page.reload(); await page.waitForTimeout(9000);
  out.offlineServer=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m?{body:m.body.slice(0,30), edited:m.edited}:'absent';},{ch,id:B.id});
  return out;
};

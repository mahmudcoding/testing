export default async ({page, ctx}) => {
  try { return await run({page,ctx}); } finally { await ctx.setOffline(false); }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const mk=async(txt)=>page.evaluate(async({ch,txt})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:txt, idempotency_key:'qaui-'+Math.random().toString(36).slice(2)})});
    const j=await r.json(); return {id:j.id, seq:j.channel_seq};},{ch,txt});
  const TR=await mk('QA-S2-UIOFF-react');
  const TE=await mk('QA-S2-UIOFF-edit');
  out.targets={TR,TE};
  await page.reload(); await page.waitForTimeout(10000);
  await ctx.setOffline(true); await page.waitForTimeout(1200);
  // --- reaction through the UI
  const rEl=page.locator(`main [data-message-id="${TR.id}"]`);
  await rEl.scrollIntoViewIfNeeded(); await rEl.hover(); await page.waitForTimeout(1000);
  const addR=rEl.locator('button[aria-label="Add reaction"]').first();
  out.reactBtn=await addR.count();
  if(out.reactBtn){
    await addR.click(); await page.waitForTimeout(1800);
    const emoji=page.locator('[frimousse-emoji]:visible').first();
    out.emojiVisible=await emoji.count();
    if(out.emojiVisible){ out.emojiChar=await emoji.innerText(); await emoji.click(); await page.waitForTimeout(2500); }
    out.reactUiAfter=await page.evaluate((id)=>{
      const e=document.querySelector(`main [data-message-id="${id}"]`);
      const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
      return {tail:(e.innerText||'').replace(/\s+/g,' ').slice(-40),
        toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
          .map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,44)))]};}, TR.id);
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  // --- edit through the UI
  const eEl=page.locator(`main [data-message-id="${TE.id}"]`);
  await eEl.scrollIntoViewIfNeeded(); await eEl.hover(); await page.waitForTimeout(1000);
  const more=eEl.locator('button[aria-label="More actions"]').first();
  if(await more.count()){
    await more.click(); await page.waitForTimeout(1500);
    const ed=page.getByText(/^Edit$/).first();
    out.editItem=await ed.count();
    if(out.editItem){
      await ed.click(); await page.waitForTimeout(2000);
      const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
      await comp.type('QA-S2-UIOFF-edit-DONE',{delay:35}); await page.waitForTimeout(500);
      await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
      out.editUiAfter=await page.evaluate((id)=>{
        const e=document.querySelector(`main [data-message-id="${id}"]`);
        return e? (e.innerText||'').replace(/\s+/g,' ').slice(-40):'gone';}, TE.id);
    } else await page.keyboard.press('Escape');
  }
  await ctx.setOffline(false); await page.waitForTimeout(18000);
  await page.reload(); await page.waitForTimeout(10000);
  out.serverAfter=await page.evaluate(async({ch,TR,TE})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=j.messages||[];
    const pick=(id)=>{const m=arr.find(x=>x.id===id);
      return m? {body:(m.body||'').slice(0,30), edited:m.edited,
        reactions:JSON.stringify(m.reactions||[]).slice(0,60)}:'absent';};
    return {react:pick(TR.id), edit:pick(TE.id)};},{ch,TR,TE});
  return out;
};

export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // fresh parent + open its thread
  const parent=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-V2-QT parent', idempotency_key:'qqt-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.reload(); await page.waitForTimeout(9000);
  const el=page.locator(`main [data-message-id="${parent}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  await el.locator('button[aria-label="Reply"]').first().click();
  await page.waitForTimeout(4500);
  const comps=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const n=await comps.count();
  const tc=comps.nth(n-1);
  for(let i=0;i<8;i++){ if((await tc.evaluate(e=>e.innerText.trim()))==='') break;
    await tc.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  out.threadComposerEmpty=await tc.evaluate(e=>e.innerText.trim()==='');
  await tc.click(); await tc.type('QA-V2-QMD **b** _i_ x-y',{delay:35}); await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  const reply=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('[data-message-id]')].reverse()
      .find(x=>/QA-V2-QMD/.test(x.innerText||''));
    return e? {id:e.getAttribute('data-message-id'), rendered:(e.innerText||'').replace(/\s+/g,' ').slice(-40)}:null;});
  out.reply=reply;
  if(!reply) return out;
  out.storedBody=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=30`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m? m.body : '(not in channel list)';},{ch,id:reply.id});
  const rEl=page.locator(`[data-message-id="${reply.id}"]`).last();
  await rEl.hover(); await page.waitForTimeout(1000);
  const rh=rEl.locator('button[aria-label="Reply here"]').first();
  out.replyHereFound=await rh.count();
  if(!out.replyHereFound){
    out.hoverButtons=await rEl.evaluate(e=>{
      const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...e.querySelectorAll('button')].filter(v).map(b=>b.getAttribute('aria-label')).filter(Boolean);});
    return out;
  }
  await rh.click(); await page.waitForTimeout(2200);
  out.composerQuote=await tc.evaluate(e=>e.innerText.replace(/\s+/g,' ').slice(0,120));
  out.pageWideQuote=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const hits=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/QA-V2-QMD|QA\\-V2\\-QMD/.test(t));
    return [...new Set(hits)].slice(0,4);});
  out.renderedOriginal=reply.rendered;
  out.PASS = /\\-|\\\*|\\_/.test(out.composerQuote||'') && !/\\-/.test(reply.rendered||'');
  return out;
};

export default async ({page}) => {
  const isChat = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Call chat/.test((p.innerText||'').trim());});
  for(let i=0;i<3 && !(await isChat()); i++){
    await page.click('button[data-testid="call-controls-chat-toggle"]'); await page.waitForTimeout(2200);
  }
  const opened = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const b=[...p.querySelectorAll('button')].filter(x=>x.getClientRects().length&&/^Thread$/i.test((x.textContent||'').trim()))[0];
    if(!b) return {err:'no Thread btn'}; b.click(); return {ok:true};});
  await page.waitForTimeout(3000);
  const panel = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?{text:(p.innerText||'').replace(/\n+/g,' | ').slice(0,300),
      inputs:[...p.querySelectorAll('textarea,input')].map(i=>i.placeholder||i.getAttribute('aria-label'))}:null;});
  if (process.env.QA_REPLY) {
    const sel='[data-testid="call-side-panel-slot"] textarea, [data-testid="call-side-panel-slot"] input[type="text"], [data-testid="call-side-panel-slot"] input:not([type])';
    const el=await page.$(sel);
    if(el){ await el.click(); await el.fill(''); await el.type(process.env.QA_REPLY,{delay:20});
      await page.waitForTimeout(400); await page.keyboard.press('Enter'); await page.waitForTimeout(4000); }
    panel.afterReply = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
      return p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,340):null;});
  }
  return {opened, panel};
};

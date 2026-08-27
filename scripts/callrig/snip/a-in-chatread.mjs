export default async ({page}) => {
  const isChat = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Call chat/.test((p.innerText||'').trim());});
  for(let i=0;i<3 && !(await isChat()); i++){
    await page.click('button[data-testid="call-controls-chat-toggle"]'); await page.waitForTimeout(2200);
  }
  return await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no chat panel'};
    const t=(p.innerText||'').replace(/\n+/g,' | ');
    return {text:t.slice(0,420), hasPriv:/priv-to-carol-1/.test(t), hasPublic:/incall-check-A1/.test(t)};});
};

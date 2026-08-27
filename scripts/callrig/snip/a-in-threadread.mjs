export default async ({page}) => {
  for(let i=0;i<3;i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
  const isChat = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Call chat/.test((p.innerText||'').trim());});
  for(let i=0;i<3 && !(await isChat()); i++){
    await page.click('button[data-testid="call-controls-chat-toggle"]'); await page.waitForTimeout(2200);
  }
  const listText = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,300):null;});
  await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const b=[...p.querySelectorAll('button')].filter(x=>x.getClientRects().length&&/^Thread$/i.test((x.textContent||'').trim()))[0];
    if(b)b.click();});
  await page.waitForTimeout(3500);
  const modal = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).find(x=>/Message thread/.test(x.innerText||''));
    return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,240):null;});
  return {listText, modal};
};

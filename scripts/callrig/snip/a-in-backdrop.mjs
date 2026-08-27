export default async ({page}) => {
  const state = ()=>page.evaluate(()=>({
    backdrops:[...document.querySelectorAll('.aloqa-modal-backdrop')].map(b=>{const q=b.getBoundingClientRect();
      return {state:b.getAttribute('data-state'), w:Math.round(q.width), h:Math.round(q.height)};}),
    panel:(document.querySelector('[data-testid="call-side-panel-slot"]')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,90)}));
  const isChat = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Call chat/.test((p.innerText||'').trim());});
  for(let i=0;i<3 && !(await isChat()); i++){
    await page.click('button[data-testid="call-controls-chat-toggle"]'); await page.waitForTimeout(2200);
  }
  const afterOpen = await state();
  // click Thread WITHOUT touching the To menu
  let threadClick='n/a';
  try {
    await page.click('[data-testid="call-side-panel-slot"] button:has-text("Thread")', {timeout:6000});
    threadClick='clicked';
  } catch(e){ threadClick='BLOCKED: '+String(e).split('\n')[0].slice(0,90); }
  await page.waitForTimeout(2000);
  const afterThread = await state();
  return {afterOpen, threadClick, afterThread};
};

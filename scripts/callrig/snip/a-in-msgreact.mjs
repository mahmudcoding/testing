export default async ({page}) => {
  for(let i=0;i<3;i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
  const isChat = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Call chat/.test((p.innerText||'').trim());});
  for(let i=0;i<3 && !(await isChat()); i++){
    await page.click('button[data-testid="call-controls-chat-toggle"]'); await page.waitForTimeout(2200);
  }
  // hover the first message row to reveal any hover actions
  const probe = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const rows=[...p.querySelectorAll('*')].filter(e=>/incall-check-A1/.test(
      [...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('')));
    const row=rows[0]; if(!row) return {err:'no message row'};
    let box=row; while(box && box.getBoundingClientRect().height<24) box=box.parentElement;
    const evt=new MouseEvent('mouseover',{bubbles:true});
    box.dispatchEvent(evt); box.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true}));
    return {ok:true, boxText:(box.innerText||'').replace(/\s+/g,' ').slice(0,80)};
  });
  await page.waitForTimeout(1500);
  const btns = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    return [...p.querySelectorAll('button')].filter(vis)
      .map(b=>((b.getAttribute('aria-label')||'')+'|'+(b.textContent||'').trim()).slice(0,32));
  });
  return {probe, buttonsInChatPanel: btns};
};

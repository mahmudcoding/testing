export default async ({page}) => {
  const isChat = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Call chat/.test((p.innerText||'').trim());});
  for(let i=0;i<3 && !(await isChat()); i++){
    await page.click('button[data-testid="call-controls-chat-toggle"]'); await page.waitForTimeout(2200);
  }
  await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const b=[...p.querySelectorAll('button')].find(x=>/^To$/i.test((x.getAttribute('aria-label')||x.textContent||'').trim())); if(b)b.click();});
  await page.waitForTimeout(2000);
  const opts = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const c=[...document.querySelectorAll('[role="menu"],[role="listbox"],[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no To menu'};
    return {items:[...p.querySelectorAll('[role="menuitem"],[role="option"],button')].filter(vis)
      .map(x=>(x.textContent||'').trim().slice(0,24))};
  });
  return opts;
};

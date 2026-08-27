export default async ({page}) => {
  for(let i=0;i<3;i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
  const isChat = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Call chat/.test((p.innerText||'').trim());});
  for(let i=0;i<3 && !(await isChat()); i++){
    await page.click('button[data-testid="call-controls-chat-toggle"]'); await page.waitForTimeout(2200);
  }
  // hover the target message row
  await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const row=[...p.querySelectorAll('*')].find(e=>/incall-check-A1/.test(
      [...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('')));
    let box=row; while(box && box.getBoundingClientRect().height<24) box=box.parentElement;
    box.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));
    box.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true}));
  });
  await page.waitForTimeout(1200);
  const opened = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const b=[...p.querySelectorAll('button')].filter(vis).find(x=>/^React$/i.test(x.getAttribute('aria-label')||''));
    if(!b) return {err:'no React btn'}; b.click(); return {ok:true};});
  if(opened.err) return opened;
  await page.waitForTimeout(2600);
  const result = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'picker did not open'};
    const all=[...p.querySelectorAll('button')].filter(vis);
    const labelled=all.filter(x=>(x.getAttribute('aria-label')||'').trim().length>0);
    const target=labelled[0];
    if(!target) return {err:'no labelled emoji', total:all.length};
    const lbl=target.getAttribute('aria-label'), ch=(target.textContent||'').trim();
    target.click();
    return {clicked:lbl, char:ch, totalButtons:all.length, labelledCount:labelled.length};
  });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,260):null;});
  return {result, after};
};

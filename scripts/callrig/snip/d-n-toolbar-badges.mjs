export default async ({page}) => {
  const out={};
  // close every side panel first
  for (const t of ['call-controls-chat-toggle','call-controls-people-toggle','call-controls-settings-toggle']) {
    const b = page.locator(`[data-testid="${t}"]`);
    if (await b.count()>0 && await b.first().getAttribute('aria-pressed')==='true'){
      const box=await b.first().boundingBox(); await page.mouse.click(box.x+box.width/2,box.y+box.height/2); await page.waitForTimeout(1000); }
  }
  await page.waitForTimeout(1500);
  out.toggles = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const out={};
    for (const t of ['call-controls-chat-toggle','call-controls-people-toggle','call-controls-settings-toggle','call-controls-screen-share']){
      const b=document.querySelector(`[data-testid="${t}"]`);
      if(!b){ out[t]=null; continue; }
      const r=b.getBoundingClientRect();
      out[t]={label:b.getAttribute('aria-label'), rect:Math.round(r.width)+'x'+Math.round(r.height),
        innerText:(b.innerText||'').trim(),
        // every descendant with text, and every descendant element type
        kids:[...b.querySelectorAll('*')].map(e=>({tag:e.tagName,tid:e.dataset.testid||null,txt:(e.innerText||'').trim().slice(0,20),vis:vis(e)})),
        // anything positioned over/next to the button within 30px that carries text
        near:[...document.querySelectorAll('*')].filter(e=>{ if(!vis(e)||e.children.length)return false;
          const q=e.getBoundingClientRect(); return Math.abs(q.left-r.left)<50 && Math.abs(q.top-r.top)<50 && (e.innerText||'').trim(); })
          .map(e=>(e.innerText||'').trim().slice(0,20))};
    }
    return out;
  });
  out.bell = await page.evaluate(()=>document.querySelector('button[aria-label^="Notifications"]')?.getAttribute('aria-label')||null);
  out.docWideRequestText = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return [...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/request|wants|asking|permission/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,90)))];});
  return out;
};

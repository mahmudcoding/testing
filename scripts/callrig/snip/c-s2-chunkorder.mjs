const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  if(!await empty(page, comp)) return {err:'composer not empty'};
  let s=''; for(let i=0;i<40;i++) s += `[QA-S2-CH-${String(i).padStart(3,'0')}]` + 'x'.repeat(480);
  out.srcLen=s.length;
  await page.evaluate((t)=>{
    const el=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    el.focus(); const dt=new DataTransfer(); dt.setData('text/plain',t);
    el.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));
  }, s);
  await page.waitForTimeout(2000);
  out.composerLen=await comp.evaluate(e=>e.innerText.length);
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST'){
    const b=JSON.parse(r.postData()||'{}').body||'';
    posts.push({first:(b.match(/QA-S2-CH-\d{3}/)||['?'])[0], last:(b.match(/QA-S2-CH-\d{3}(?![\s\S]*QA-S2-CH-\d{3})/)||['?'])[0], len:b.length}); } };
  page.on('request', onReq);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(9000);
  page.off('request', onReq);
  out.postOrder=posts;
  out.notices=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
    .map(e=>e.textContent.trim().slice(0,70)));
  // rendered order, top to bottom
  out.rendered = await page.evaluate(()=>{
    const res=[];
    for (const el of document.querySelectorAll('main [data-message-id]')){
      const t=el.innerText||''; if(!/QA-S2-CH-/.test(t)) continue;
      const ms=t.match(/QA-S2-CH-\d{3}/g)||[];
      res.push({id:el.getAttribute('data-message-id'), first:ms[0], last:ms[ms.length-1], n:ms.length});
    }
    return res;
  });
  await empty(page, comp);
  return out;
};

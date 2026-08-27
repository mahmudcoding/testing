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
  const paste=(t)=>page.evaluate((t)=>{
    const el=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    el.focus(); const dt=new DataTransfer(); dt.setData('text/plain',t);
    el.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));
  }, t);
  const run=async(n, tag)=>{
    if(!await empty(page, comp)) return {tag, err:'not empty'};
    await paste(`${tag} `+'x'.repeat(n));
    await page.waitForTimeout(1500);
    const composerLen=await comp.evaluate(e=>e.innerText.length);
    const recs=[];
    const onResp=async(r)=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.request().method()==='POST'){
      let b=''; try{ b=(await r.text()).slice(0,140);}catch(e){}
      recs.push({status:r.status(), body:b, reqLen:(r.request().postData()||'').length}); } };
    page.on('response', onResp);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(6000);
    page.off('response', onResp);
    const notices=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
      .map(e=>e.textContent.trim().slice(0,80)));
    const rendered=await page.evaluate((tag)=>{
      const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(e=>new RegExp(tag).test(e.innerText||''));
      return el? {len:(el.innerText||'').length, head:(el.innerText||'').replace(/\s+/g,' ').slice(0,50)}:'not found';
    }, tag);
    return {tag, composerLen, recs, notices, rendered,
      composerAfter:(await comp.evaluate(e=>e.innerText)).replace(/\n/g,'\\n').slice(0,30)};
  };
  out.k20 = await run(20000,'QA-S2-LONG20K');
  await empty(page, comp);
  return out;
};
